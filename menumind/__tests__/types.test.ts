import type {
  DishClassification,
  ConfidenceLevel,
  SeverityLevel,
  ScanStatus,
  DietaryProfile,
  Profile,
  Scan,
  ScanItem,
  ScanSummary,
} from '../src/types';

describe('Type definitions', () => {
  it('creates a valid DietaryProfile', () => {
    const profile: DietaryProfile = {
      allergies: ['peanuts', 'dairy'],
      dietTypes: ['vegan'],
      severityLevels: { peanuts: 'severe', dairy: 'mild' },
      customRestrictions: ['No cilantro'],
      disclaimerAcceptedAt: new Date().toISOString(),
      onboardingCompleted: true,
    };

    expect(profile.allergies).toHaveLength(2);
    expect(profile.dietTypes).toContain('vegan');
    expect(profile.severityLevels.peanuts).toBe('severe');
  });

  it('creates a valid ScanItem', () => {
    const item: ScanItem = {
      id: 'test-id',
      scanId: 'scan-id',
      dishName: 'Pad Thai',
      originalName: 'ผัดไทย',
      classification: 'caution',
      confidence: 'medium',
      likelyIngredients: ['rice noodles', 'peanuts', 'tofu', 'bean sprouts'],
      allergensDetected: ['peanuts'],
      modificationSuggestions: ['Ask for pad thai without crushed peanuts'],
      serverPrompts: ['Does the pad thai use peanut oil?'],
      reasoning: 'Pad Thai typically contains crushed peanuts as a garnish.',
      sortOrder: 0,
      createdAt: new Date().toISOString(),
    };

    expect(item.classification).toBe('caution');
    expect(item.allergensDetected).toContain('peanuts');
    expect(item.modificationSuggestions).toHaveLength(1);
  });

  it('validates classification values', () => {
    const classifications: DishClassification[] = ['safe', 'caution', 'avoid'];
    expect(classifications).toHaveLength(3);
  });

  it('validates confidence values', () => {
    const levels: ConfidenceLevel[] = ['high', 'medium', 'low'];
    expect(levels).toHaveLength(3);
  });

  it('creates a valid ScanSummary', () => {
    const summary: ScanSummary = {
      id: 'scan-1',
      imageUrl: 'menu-photos/user1/scan1.jpg',
      restaurantName: 'Thai Garden',
      itemCount: 15,
      safeCount: 10,
      cautionCount: 3,
      avoidCount: 2,
      createdAt: new Date().toISOString(),
    };

    expect(summary.safeCount + summary.cautionCount + summary.avoidCount).toBeLessThanOrEqual(
      summary.itemCount
    );
  });
});
