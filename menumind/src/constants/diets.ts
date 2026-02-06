import type { DietType } from '../types';

export const DIET_OPTIONS: { value: DietType; label: string; description: string }[] = [
  { value: 'keto', label: 'Keto', description: 'Low carb, high fat' },
  { value: 'vegan', label: 'Vegan', description: 'No animal products' },
  { value: 'vegetarian', label: 'Vegetarian', description: 'No meat or fish' },
  { value: 'halal', label: 'Halal', description: 'Islamic dietary laws' },
  { value: 'kosher', label: 'Kosher', description: 'Jewish dietary laws' },
  { value: 'low_fodmap', label: 'Low-FODMAP', description: 'For IBS management' },
  { value: 'paleo', label: 'Paleo', description: 'Whole, unprocessed foods' },
];
