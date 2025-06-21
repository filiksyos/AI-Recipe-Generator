import { NextApiRequest, NextApiResponse } from 'next'
import { GenerateRecipeRequest, GenerateRecipeResponse, Recipe } from '@/types'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GenerateRecipeResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { image }: GenerateRecipeRequest = req.body

    if (!image) {
      return res.status(400).json({ error: 'Image is required' })
    }

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      console.error('OpenRouter API key not found')
      return res.status(500).json({ error: 'API configuration error' })
    }

    // Prepare the prompt for recipe generation
    const prompt = `Analyze this food image and generate a detailed recipe. Please provide:

1. A creative and appetizing title for the dish
2. A brief description of the dish
3. A complete list of ingredients with measurements
4. Step-by-step cooking instructions
5. Estimated prep time and cook time
6. Number of servings
7. Difficulty level (Easy, Medium, or Hard)

Please format your response as a JSON object with the following structure:
{
  "title": "Dish Name",
  "description": "Brief description of the dish",
  "ingredients": ["ingredient 1", "ingredient 2", ...],
  "instructions": ["step 1", "step 2", ...],
  "prepTime": "X minutes",
  "cookTime": "X minutes", 
  "servings": "X servings",
  "difficulty": "Easy/Medium/Hard"
}

Be specific with measurements and cooking times. Make the recipe practical and achievable for home cooks.`

    // Call OpenRouter API with Gemini vision model
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.SITE_URL || 'http://localhost:3000',
        'X-Title': 'AI Recipe Generator',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${image}`
                }
              }
            ]
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('OpenRouter API error:', response.status, errorData)
      return res.status(500).json({ 
        error: `Failed to generate recipe: ${response.status} ${response.statusText}` 
      })
    }

    const data = await response.json()
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Unexpected API response structure:', data)
      return res.status(500).json({ error: 'Invalid response from AI service' })
    }

    const content = data.choices[0].message.content
    
    try {
      // Extract JSON from the response (it might be wrapped in markdown)
      let jsonString = content
      
      // Remove markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
      if (jsonMatch) {
        jsonString = jsonMatch[1]
      }
      
      // Try to find JSON object in the text
      const jsonStart = jsonString.indexOf('{')
      const jsonEnd = jsonString.lastIndexOf('}')
      
      if (jsonStart !== -1 && jsonEnd !== -1) {
        jsonString = jsonString.substring(jsonStart, jsonEnd + 1)
      }
      
      const recipe: Recipe = JSON.parse(jsonString)
      
      // Validate the recipe structure
      if (!recipe.title || !recipe.ingredients || !recipe.instructions) {
        throw new Error('Invalid recipe structure')
      }
      
      // Ensure arrays are arrays
      if (!Array.isArray(recipe.ingredients)) {
        recipe.ingredients = [recipe.ingredients]
      }
      if (!Array.isArray(recipe.instructions)) {
        recipe.instructions = [recipe.instructions]
      }
      
      return res.status(200).json({ recipe })
      
    } catch (parseError) {
      console.error('Failed to parse recipe JSON:', parseError)
      console.error('Raw content:', content)
      
      // Fallback: try to extract information manually
      try {
        const fallbackRecipe = extractRecipeFromText(content)
        return res.status(200).json({ recipe: fallbackRecipe })
      } catch (fallbackError) {
        console.error('Fallback parsing also failed:', fallbackError)
        return res.status(500).json({ 
          error: 'Failed to parse recipe from AI response' 
        })
      }
    }
    
  } catch (error) {
    console.error('Recipe generation error:', error)
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    })
  }
}

// Fallback function to extract recipe information from unstructured text
function extractRecipeFromText(text: string): Recipe {
  const lines = text.split('\n').filter(line => line.trim())
  
  // Try to extract title (usually first line or after "Title:")
  let title = 'Delicious Recipe'
  const titleMatch = text.match(/(?:title|dish|recipe):\s*(.+)/i)
  if (titleMatch) {
    title = titleMatch[1].trim()
  } else if (lines[0] && !lines[0].includes(':')) {
    title = lines[0].trim()
  }
  
  // Extract ingredients (look for lines starting with numbers, bullets, or "ingredients" section)
  const ingredients: string[] = []
  let inIngredientsSection = false
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    
    if (/ingredients/i.test(trimmedLine)) {
      inIngredientsSection = true
      continue
    }
    
    if (/instructions|directions|steps/i.test(trimmedLine)) {
      inIngredientsSection = false
      continue
    }
    
    if (inIngredientsSection || /^[-•*\d]+[\s\.)]/i.test(trimmedLine)) {
      const cleaned = trimmedLine.replace(/^[-•*\d]+[\s\.)]/i, '').trim()
      if (cleaned && !ingredients.includes(cleaned)) {
        ingredients.push(cleaned)
      }
    }
  }
  
  // Extract instructions
  const instructions: string[] = []
  let inInstructionsSection = false
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    
    if (/instructions|directions|steps/i.test(trimmedLine)) {
      inInstructionsSection = true
      continue
    }
    
    if (inInstructionsSection || /^step\s*\d+/i.test(trimmedLine)) {
      const cleaned = trimmedLine.replace(/^step\s*\d+[:\.)]/i, '').trim()
      if (cleaned && !instructions.includes(cleaned)) {
        instructions.push(cleaned)
      }
    }
  }
  
  // Fallback if no structured data found
  if (ingredients.length === 0) {
    ingredients.push('Ingredients not clearly specified in the image')
  }
  
  if (instructions.length === 0) {
    instructions.push('Instructions not clearly specified in the image')
  }
  
  return {
    title,
    description: 'Recipe generated from image analysis',
    ingredients,
    instructions,
    prepTime: '30 minutes',
    cookTime: '30 minutes',
    servings: '4 servings',
    difficulty: 'Medium'
  }
} 