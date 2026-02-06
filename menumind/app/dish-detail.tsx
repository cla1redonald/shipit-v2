import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
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
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#10B981" />
      </SafeAreaView>
    );
  }

  if (!item) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
        <Text className="text-lg text-gray-500">Dish not found</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-brand font-medium">Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
        <View className="w-10" />
        <View className="w-10 h-1 bg-gray-300 rounded-full" />
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-brand font-medium">Done</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6" contentContainerClassName="pb-8">
        {/* Dish name */}
        <Text className="text-2xl font-bold text-gray-900 mb-1">{item.dishName}</Text>
        {item.originalName && (
          <Text className="text-base text-gray-500 mb-3">{item.originalName}</Text>
        )}

        {/* Classification & confidence */}
        <View className="flex-row items-center gap-3 mb-6">
          <ClassificationBadge classification={item.classification} size="lg" />
          <ConfidenceBadge confidence={item.confidence} />
        </View>

        {/* Allergens detected */}
        {item.allergensDetected.length > 0 && (
          <View className="bg-avoid-light rounded-xl p-4 mb-4">
            <Text className="text-sm font-semibold text-avoid-dark mb-2">
              Allergens Detected
            </Text>
            {item.allergensDetected.map((allergen, i) => (
              <Text key={i} className="text-sm text-avoid-dark">• {allergen}</Text>
            ))}
          </View>
        )}

        {/* Reasoning */}
        {item.reasoning && (
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-1">
              Why this classification
            </Text>
            <Text className="text-sm text-gray-600 leading-5">{item.reasoning}</Text>
          </View>
        )}

        {/* Likely ingredients */}
        {item.likelyIngredients.length > 0 && (
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-1">
              Likely Ingredients
            </Text>
            <View className="flex-row flex-wrap gap-1.5">
              {item.likelyIngredients.map((ingredient, i) => {
                const isAllergen = item.allergensDetected.some(
                  (a) => ingredient.toLowerCase().includes(a.toLowerCase())
                );
                return (
                  <View
                    key={i}
                    className={`px-2.5 py-1 rounded-full ${
                      isAllergen ? 'bg-avoid-light' : 'bg-gray-100'
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        isAllergen ? 'text-avoid-dark' : 'text-gray-600'
                      }`}
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
          <View className="bg-brand-light rounded-xl p-4 mb-4">
            <Text className="text-sm font-semibold text-brand-dark mb-2">
              You could ask for...
            </Text>
            {item.modificationSuggestions.map((mod, i) => (
              <Text key={i} className="text-sm text-brand-dark mb-1">• {mod}</Text>
            ))}
          </View>
        )}

        {/* Server prompts */}
        {item.serverPrompts.length > 0 && (
          <View className="bg-caution-light rounded-xl p-4 mb-4">
            <Text className="text-sm font-semibold text-caution-dark mb-2">
              Ask your server...
            </Text>
            {item.serverPrompts.map((prompt, i) => (
              <Text key={i} className="text-sm text-caution-dark mb-1">• {prompt}</Text>
            ))}
          </View>
        )}
      </ScrollView>

      <DisclaimerFooter />
    </SafeAreaView>
  );
}
