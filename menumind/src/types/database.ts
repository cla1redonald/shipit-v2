export type DishClassification = 'safe' | 'caution' | 'avoid';
export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type SeverityLevel = 'mild' | 'moderate' | 'severe';
export type ScanStatus = 'uploading' | 'analyzing' | 'complete' | 'error';

export type Allergen =
  | 'peanuts'
  | 'tree_nuts'
  | 'shellfish'
  | 'fish'
  | 'dairy'
  | 'eggs'
  | 'wheat_gluten'
  | 'soy'
  | 'sesame';

export type DietType =
  | 'keto'
  | 'vegan'
  | 'vegetarian'
  | 'halal'
  | 'kosher'
  | 'low_fodmap'
  | 'paleo';

export interface DietaryProfile {
  allergies: string[];
  dietTypes: DietType[];
  severityLevels: Record<string, SeverityLevel>;
  customRestrictions: string[];
  disclaimerAcceptedAt: string | null;
  onboardingCompleted: boolean;
}

export interface Profile {
  id: string;
  userId: string;
  allergies: string[];
  dietTypes: DietType[];
  severityLevels: Record<string, SeverityLevel>;
  customRestrictions: string[];
  disclaimerAcceptedAt: string | null;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Scan {
  id: string;
  userId: string;
  imageUrl: string | null;
  status: ScanStatus;
  restaurantName: string | null;
  languageDetected: string | null;
  rawApiResponse: Record<string, unknown> | null;
  errorCode: string | null;
  errorMessage: string | null;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ScanItem {
  id: string;
  scanId: string;
  dishName: string;
  originalName: string | null;
  classification: DishClassification;
  confidence: ConfidenceLevel;
  likelyIngredients: string[];
  allergensDetected: string[];
  modificationSuggestions: string[];
  serverPrompts: string[];
  reasoning: string | null;
  sortOrder: number;
  createdAt: string;
}

export interface ScanSummary {
  id: string;
  imageUrl: string | null;
  restaurantName: string | null;
  itemCount: number;
  safeCount: number;
  cautionCount: number;
  avoidCount: number;
  createdAt: string;
}
