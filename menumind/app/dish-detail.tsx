import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { useScanStore } from '../src/stores/scanStore';
import { ClassificationBadge, ConfidenceBadge, DisclaimerFooter } from '../src/components/ui';
import type { ScanItem } from '../src/types';

export default function DishDetailScreen() {
  const router = useRouter();
  const { itemId, scanId } = useLocalSearchParams<{ itemId: string; scanId: string }>();
  const currentItems = useScanStore((s) => s.currentScan.items);
  const fetchScanItems = useScanStore((s) => s.fetchScanItems);
  const [item, setItem] = useState<ScanItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // First check current scan items
    const found = currentItems.find((i) => i.id === itemId);
    if (found) {
      setItem(found);
      setLoading(false);
      return;
    }

    // Fall back to fetching from history
    if (scanId) {
      fetchScanItems(scanId)
        .then((items) => {
          const match = items.find((i) => i.id === itemId);
          if (match) setItem(match);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [itemId, scanId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </SafeAreaView>
    );
  }

  if (!item) {
    return (
      <SafeAreaView style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>Dish not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.goBackButton}>
          <Text style={styles.goBackText}>Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.topBarSpacer} />
        <View style={styles.dragHandle} />
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Dish name */}
        <Text style={styles.dishName}>{item.dishName}</Text>
        {item.originalName && (
          <Text style={styles.originalName}>{item.originalName}</Text>
        )}

        {/* Classification & confidence */}
        <View style={styles.badgeRow}>
          <ClassificationBadge classification={item.classification} size="lg" />
          <ConfidenceBadge confidence={item.confidence} />
        </View>

        {/* Allergens detected */}
        {item.allergensDetected.length > 0 && (
          <View style={styles.allergensBox}>
            <Text style={styles.allergensTitle}>
              Allergens Detected
            </Text>
            {item.allergensDetected.map((allergen, i) => (
              <Text key={i} style={styles.allergenItem}>• {allergen}</Text>
            ))}
          </View>
        )}

        {/* Reasoning */}
        {item.reasoning && (
          <View style={styles.reasoningSection}>
            <Text style={styles.reasoningTitle}>
              Why this classification
            </Text>
            <Text style={styles.reasoningBody}>{item.reasoning}</Text>
          </View>
        )}

        {/* Likely ingredients */}
        {item.likelyIngredients.length > 0 && (
          <View style={styles.ingredientsSection}>
            <Text style={styles.ingredientsTitle}>
              Likely Ingredients
            </Text>
            <View style={styles.ingredientsList}>
              {item.likelyIngredients.map((ingredient, i) => {
                const isAllergen = item.allergensDetected.some(
                  (a) => ingredient.toLowerCase().includes(a.toLowerCase())
                );
                return (
                  <View
                    key={i}
                    style={[
                      styles.ingredientChip,
                      isAllergen ? styles.ingredientChipAllergen : styles.ingredientChipNormal,
                    ]}
                  >
                    <Text
                      style={[
                        styles.ingredientChipText,
                        isAllergen ? styles.ingredientChipTextAllergen : styles.ingredientChipTextNormal,
                      ]}
                    >
                      {ingredient}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Modification suggestions */}
        {item.modificationSuggestions.length > 0 && (
          <View style={styles.modificationsBox}>
            <Text style={styles.modificationsTitle}>
              You could ask for...
            </Text>
            {item.modificationSuggestions.map((mod, i) => (
              <Text key={i} style={styles.modificationItem}>• {mod}</Text>
            ))}
          </View>
        )}

        {/* Server prompts */}
        {item.serverPrompts.length > 0 && (
          <View style={styles.serverPromptsBox}>
            <Text style={styles.serverPromptsTitle}>
              Ask your server...
            </Text>
            {item.serverPrompts.map((prompt, i) => (
              <Text key={i} style={styles.serverPromptItem}>• {prompt}</Text>
            ))}
          </View>
        )}
      </ScrollView>

      <DisclaimerFooter />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  notFoundText: {
    fontSize: 18,
    color: '#6B7280',
  },
  goBackButton: {
    marginTop: 16,
  },
  goBackText: {
    color: '#10B981',
    fontWeight: '500',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  topBarSpacer: {
    width: 40,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 9999,
  },
  doneText: {
    color: '#10B981',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  dishName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  originalName: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  allergensBox: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  allergensTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#991B1B',
    marginBottom: 8,
  },
  allergenItem: {
    fontSize: 14,
    color: '#991B1B',
  },
  reasoningSection: {
    marginBottom: 16,
  },
  reasoningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  reasoningBody: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  ingredientsSection: {
    marginBottom: 16,
  },
  ingredientsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  ingredientsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  ingredientChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  ingredientChipAllergen: {
    backgroundColor: '#FEE2E2',
  },
  ingredientChipNormal: {
    backgroundColor: '#F3F4F6',
  },
  ingredientChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  ingredientChipTextAllergen: {
    color: '#991B1B',
  },
  ingredientChipTextNormal: {
    color: '#4B5563',
  },
  modificationsBox: {
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  modificationsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 8,
  },
  modificationItem: {
    fontSize: 14,
    color: '#065F46',
    marginBottom: 4,
  },
  serverPromptsBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  serverPromptsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  serverPromptItem: {
    fontSize: 14,
    color: '#92400E',
    marginBottom: 4,
  },
});
