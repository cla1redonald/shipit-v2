import type { Allergen } from '../types';

export const COMMON_ALLERGENS: { value: Allergen; label: string }[] = [
  { value: 'peanuts', label: 'Peanuts' },
  { value: 'tree_nuts', label: 'Tree Nuts' },
  { value: 'shellfish', label: 'Shellfish' },
  { value: 'fish', label: 'Fish' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'eggs', label: 'Eggs' },
  { value: 'wheat_gluten', label: 'Wheat/Gluten' },
  { value: 'soy', label: 'Soy' },
  { value: 'sesame', label: 'Sesame' },
];

export const ALLERGEN_LABELS: Record<string, string> = Object.fromEntries(
  COMMON_ALLERGENS.map(a => [a.value, a.label])
);
