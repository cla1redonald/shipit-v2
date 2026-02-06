import { DishClassification, ConfidenceLevel } from './database';

export interface AnalysisRequest {
  scanId: string;
  imageUrl: string;
  dietaryProfile: {
    allergies: string[];
    dietTypes: string[];
    severityLevels: Record<string, string>;
    customRestrictions: string[];
  };
}

export interface AnalysisResponse {
  restaurantName: string | null;
  languageDetected: string | null;
  menuReadable: boolean;
  errorMessage: string | null;
  dishes: AnalyzedDish[];
}

export interface AnalyzedDish {
  dishName: string;
  originalName: string | null;
  classification: DishClassification;
  confidence: ConfidenceLevel;
  likelyIngredients: string[];
  allergensDetected: string[];
  modificationSuggestions: string[];
  serverPrompts: string[];
  reasoning: string;
}
