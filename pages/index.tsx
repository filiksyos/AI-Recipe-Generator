import { useState, useRef } from 'react'
import Head from 'next/head'
import { Recipe, ImageUploadState, LoadingState, GenerateRecipeResponse } from '@/types'

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imageState, setImageState] = useState<ImageUploadState>({
    file: null,
    preview: null,
    isUploading: false,
    error: null
  })
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    message: ''
  })
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setImageState(prev => ({ ...prev, error: 'Please select an image file' }))
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setImageState(prev => ({ ...prev, error: 'Image size must be less than 10MB' }))
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setImageState({
        file,
        preview: result,
        isUploading: false,
        error: null
      })
      setRecipe(null)
      setError(null)
    }
    reader.readAsDataURL(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const removeImage = () => {
    setImageState({
      file: null,
      preview: null,
      isUploading: false,
      error: null
    })
    setRecipe(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const generateRecipe = async () => {
    if (!imageState.file || !imageState.preview) {
      setError('Please upload an image first')
      return
    }

    setLoadingState({ isLoading: true, message: 'Analyzing your delicious food...' })
    setError(null)
    setRecipe(null)

    try {
      // Convert image to base64 (remove data URL prefix)
      const base64Image = imageState.preview.split(',')[1]

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64Image }),
      })

      const data: GenerateRecipeResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate recipe')
      }

      if (data.recipe) {
        setRecipe(data.recipe)
        setLoadingState({ isLoading: false, message: '' })
      } else {
        throw new Error('No recipe returned from API')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while generating the recipe')
      setLoadingState({ isLoading: false, message: '' })
    }
  }

  return (
    <>
      <Head>
        <title>AI Recipe Generator 🧑‍🍳</title>
        <meta name="description" content="Generate recipes from food images using AI" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen gradient-bg py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="text-8xl mb-6">🧑‍🍳</div>
            <h1 className="text-5xl font-bold text-gray-800 mb-4">
              AI Recipe Generator
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Upload a photo of any dish and let our AI chef reverse-engineer the perfect recipe for you!
            </p>
          </div>

          {/* Upload Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Upload Your Food Image</h2>
              
              {!imageState.preview ? (
                <div
                  className="upload-area rounded-xl p-12 text-center cursor-pointer"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="text-6xl mb-4">📸</div>
                  <p className="text-gray-600 text-lg mb-2">
                    Click here or drag and drop your food image
                  </p>
                  <p className="text-gray-400 text-sm">
                    Supports JPG, PNG, GIF up to 10MB
                  </p>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imageState.preview}
                    alt="Uploaded food"
                    className="w-full max-w-md mx-auto rounded-xl shadow-lg"
                  />
                  <button
                    onClick={removeImage}
                    className="absolute top-4 right-4 bg-black text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-800 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {imageState.error && (
                <p className="text-red-500 text-center mt-4">{imageState.error}</p>
              )}
            </div>

            {imageState.preview && (
              <div className="text-center">
                <button
                  onClick={generateRecipe}
                  disabled={loadingState.isLoading}
                  className="bg-chef-red hover:bg-chef-dark-red disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-xl text-lg button-shadow transition-all duration-300 transform hover:scale-105"
                >
                  {loadingState.isLoading ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin-slow mr-3">🧑‍🍳</div>
                      <span className="loading-dots">Generating Recipe</span>
                    </span>
                  ) : (
                    'Generate Recipe ✨'
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Loading Message */}
          {loadingState.isLoading && (
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-lg text-gray-600">{loadingState.message}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
              <div className="flex items-center">
                <div className="text-2xl mr-3">⚠️</div>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Recipe Display */}
          {recipe && (
            <div className="recipe-card rounded-2xl shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="text-4xl mr-4">📝</div>
                <h2 className="text-3xl font-bold text-gray-800">{recipe.title}</h2>
              </div>

              {recipe.description && (
                <p className="text-gray-700 text-lg mb-6 italic">{recipe.description}</p>
              )}

              {/* Recipe Meta Info */}
              {(recipe.prepTime || recipe.cookTime || recipe.servings || recipe.difficulty) && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {recipe.prepTime && (
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-2xl mb-1">⏱️</div>
                      <div className="text-sm text-gray-600">Prep Time</div>
                      <div className="font-semibold">{recipe.prepTime}</div>
                    </div>
                  )}
                  {recipe.cookTime && (
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-2xl mb-1">🔥</div>
                      <div className="text-sm text-gray-600">Cook Time</div>
                      <div className="font-semibold">{recipe.cookTime}</div>
                    </div>
                  )}
                  {recipe.servings && (
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-2xl mb-1">👥</div>
                      <div className="text-sm text-gray-600">Servings</div>
                      <div className="font-semibold">{recipe.servings}</div>
                    </div>
                  )}
                  {recipe.difficulty && (
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-2xl mb-1">⭐</div>
                      <div className="text-sm text-gray-600">Difficulty</div>
                      <div className="font-semibold">{recipe.difficulty}</div>
                    </div>
                  )}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-8">
                {/* Ingredients */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                    <span className="text-3xl mr-3">🛒</span>
                    Ingredients
                  </h3>
                  <ul className="space-y-3">
                    {recipe.ingredients.map((ingredient, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-chef-red mr-3 mt-1">•</span>
                        <span className="text-gray-700">{ingredient}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Instructions */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                    <span className="text-3xl mr-3">👨‍🍳</span>
                    Instructions
                  </h3>
                  <ol className="space-y-4">
                    {recipe.instructions.map((instruction, index) => (
                      <li key={index} className="flex items-start">
                        <span className="bg-chef-red text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-1 flex-shrink-0">
                          {index + 1}
                        </span>
                        <span className="text-gray-700">{instruction}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
} 