# 🧑‍🍳 AI Recipe Generator

A modern Next.js web application that uses AI to analyze food images and generate detailed recipes. Upload a photo of any dish and get a complete recipe with ingredients, instructions, and cooking details!

This app was built in one prompt with cursor.

![AI Recipe Generator](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-teal)
![OpenRouter](https://img.shields.io/badge/OpenRouter-API-green)

## ✨ Features

- **🖼️ Image Upload**: Drag and drop or click to upload food images
- **🤖 AI-Powered Analysis**: Uses Google's Gemini 2.0 Flash model via OpenRouter
- **📝 Complete Recipes**: Get detailed recipes with:
  - Creative dish titles
  - Ingredient lists with measurements
  - Step-by-step instructions
  - Prep and cook times
  - Serving sizes
  - Difficulty levels
- **🎨 Modern UI**: Clean, responsive design with Tailwind CSS
- **⚡ Real-time Processing**: Live loading states and error handling
- **📱 Mobile Friendly**: Responsive design works on all devices

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- pnpm package manager
- OpenRouter API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ai-recipe-generator
   ```

2. **Install dependencies**
   ```bash
   pnpm install --save
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```

4. **Configure your OpenRouter API key**
   
   Edit `.env.local` and add your OpenRouter API key:
   ```
   OPENROUTER_API_KEY=your_actual_api_key_here
   SITE_URL=http://localhost:3000
   ```

   Get your API key from: [https://openrouter.ai/keys](https://openrouter.ai/keys)

5. **Run the development server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with custom components
- **AI Model**: Google Gemini 2.0 Flash (via OpenRouter)
- **Image Processing**: Base64 encoding for API transmission
- **Package Manager**: pnpm

## 📁 Project Structure

```
ai-recipe-generator/
├── pages/
│   ├── api/
│   │   └── generate.ts      # API route for recipe generation
│   ├── _app.tsx             # App wrapper with global styles
│   └── index.tsx            # Main application page
├── styles/
│   └── globals.css          # Global styles and Tailwind imports
├── types/
│   └── index.ts             # TypeScript type definitions
├── .env.local.example       # Environment variables template
└── README.md               # Project documentation
```

## 🎯 Usage

1. **Upload an Image**: Click the upload area or drag and drop a food image
2. **Generate Recipe**: Click the "Generate Recipe" button
3. **View Results**: The AI will analyze your image and provide a complete recipe
4. **Copy or Save**: Use the generated recipe for cooking!

## 🎨 Customization

### Styling
The app uses Tailwind CSS with custom colors defined in `tailwind.config.js`:
- `chef-red`: Primary red color for buttons and accents
- `chef-dark-red`: Darker red for hover states
- `recipe-bg`: Light background for recipe cards
- `recipe-border`: Border color for recipe cards

### AI Prompts
Modify the prompt in `pages/api/generate.ts` to customize how the AI analyzes images and generates recipes.

## 🔧 API Reference

### POST `/api/generate`

Generates a recipe from an uploaded image.

**Request Body:**
```json
{
  "image": "base64_encoded_image_string"
}
```

**Response:**
```json
{
  "recipe": {
    "title": "Delicious Pasta Carbonara",
    "description": "Creamy Italian pasta dish...",
    "ingredients": ["400g spaghetti", "200g pancetta", ...],
    "instructions": ["Boil water for pasta", "Cook pancetta...", ...],
    "prepTime": "15 minutes",
    "cookTime": "20 minutes",
    "servings": "4 servings",
    "difficulty": "Medium"
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenRouter](https://openrouter.ai/) for AI model access
- [Google Gemini](https://ai.google.dev/) for the vision AI model
- [Next.js](https://nextjs.org/) for the React framework
- [Tailwind CSS](https://tailwindcss.com/) for styling

## 🐛 Troubleshooting

### Common Issues

1. **API Key Error**: Make sure your OpenRouter API key is correctly set in `.env.local`
2. **Image Upload Failed**: Check that your image is under 10MB and in a supported format (JPG, PNG, GIF)
3. **Recipe Generation Failed**: Ensure you have sufficient credits in your OpenRouter account

### Support

If you encounter any issues, please:
1. Check the browser console for error messages
2. Verify your environment variables are set correctly
3. Ensure your OpenRouter API key has sufficient credits
4. Open an issue on GitHub with detailed error information

---

**Made with ❤️ and 🧑‍🍳 for food lovers everywhere!** 