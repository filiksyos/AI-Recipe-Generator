export interface Recipe {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime?: string;
  cookTime?: string;
  servings?: string;
  difficulty?: string;
}

export interface GenerateRecipeRequest {
  image: string; // base64 encoded image
}

export interface GenerateRecipeResponse {
  recipe?: Recipe;
  error?: string;
}

export interface ImageUploadState {
  file: File | null;
  preview: string | null;
  isUploading: boolean;
  error: string | null;
}

export interface LoadingState {
  isLoading: boolean;
  message: string;
} 