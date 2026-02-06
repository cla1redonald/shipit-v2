import { COMMON_ALLERGENS, ALLERGEN_LABELS, DIET_OPTIONS } from '../src/constants';

describe('Constants', () => {
  describe('COMMON_ALLERGENS', () => {
    it('contains the top 9 FDA allergens', () => {
      const values = COMMON_ALLERGENS.map((a) => a.value);
      expect(values).toContain('peanuts');
      expect(values).toContain('tree_nuts');
      expect(values).toContain('shellfish');
      expect(values).toContain('fish');
      expect(values).toContain('dairy');
      expect(values).toContain('eggs');
      expect(values).toContain('wheat_gluten');
      expect(values).toContain('soy');
      expect(values).toContain('sesame');
      expect(COMMON_ALLERGENS).toHaveLength(9);
    });

    it('has labels for all allergens', () => {
      COMMON_ALLERGENS.forEach((allergen) => {
        expect(allergen.label).toBeTruthy();
        expect(typeof allergen.label).toBe('string');
      });
    });
  });

  describe('ALLERGEN_LABELS', () => {
    it('provides a lookup map from value to label', () => {
      expect(ALLERGEN_LABELS['peanuts']).toBe('Peanuts');
      expect(ALLERGEN_LABELS['wheat_gluten']).toBe('Wheat/Gluten');
    });
  });

  describe('DIET_OPTIONS', () => {
    it('contains expected diet types', () => {
      const values = DIET_OPTIONS.map((d) => d.value);
      expect(values).toContain('vegan');
      expect(values).toContain('keto');
      expect(values).toContain('halal');
      expect(values).toContain('kosher');
      expect(values).toContain('low_fodmap');
    });

    it('has descriptions for all diet types', () => {
      DIET_OPTIONS.forEach((diet) => {
        expect(diet.description).toBeTruthy();
      });
    });
  });
});
