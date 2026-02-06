import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useScanStore } from '../../../src/stores/scanStore';
import { DishCard, DisclaimerFooter, EmptyState, Button } from '../../../src/components/ui';
import type { DishClassification } from '../../../src/types';

type Filter = 'all' | DishClassification;

export default function ResultsScreen() {
  const router = useRouter();
  const currentScan = useScanStore((s) => s.currentScan);
  const resetCurrentScan = useScanStore((s) => s.resetCurrentScan);
  const [filter, setFilter] = useState<Filter>('all');

  const items = currentScan.items;
  const filteredItems = filter === 'all' ? items : items.filter((i) => i.classification === filter);

  const counts = {
    safe: items.filter((i) => i.classification === 'safe').length,
    caution: items.filter((i) => i.classification === 'caution').length,
    avoid: items.filter((i) => i.classification === 'avoid').length,
  };

  const filters: { value: Filter; label: string }[] = [
    { value: 'all', label: `All (${items.length})` },
    { value: 'safe', label: `Safe (${counts.safe})` },
    { value: 'caution', label: `Caution (${counts.caution})` },
    { value: 'avoid', label: `Avoid (${counts.avoid})` },
  ];

  if (items.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <EmptyState
          title="No dishes found"
          description="We couldn't identify any dishes in this photo. Try retaking the photo with better lighting."
          actionLabel="Scan Another Menu"
          onAction={() => {
            resetCurrentScan();
            router.replace('/(tabs)/scan');
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <View className="bg-white px-6 pt-4 pb-3 border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-3">
          <View>
            {currentScan.results?.restaurantName && (
              <Text className="text-lg font-bold text-gray-900">
                {currentScan.results.restaurantName}
              </Text>
            )}
            <Text className="text-sm text-gray-500">
              {counts.safe} safe, {counts.caution} caution, {counts.avoid} avoid
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              resetCurrentScan();
              router.replace('/(tabs)/scan/camera');
            }}
          >
            <Text className="text-brand font-semibold text-sm">New Scan</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
          {filters.map((f) => (
            <TouchableOpacity
              key={f.value}
              className={`px-4 py-2 rounded-full mr-2 ${
                filter === f.value ? 'bg-brand' : 'bg-gray-100'
              }`}
              onPress={() => setFilter(f.value)}
            >
              <Text
                className={`text-sm font-medium ${
                  filter === f.value ? 'text-white' : 'text-gray-600'
                }`}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView className="flex-1 px-4 pt-3" contentContainerClassName="pb-4 gap-3">
        {filteredItems.map((item) => (
          <DishCard
            key={item.id}
            item={item}
            onPress={() =>
              router.push({
                pathname: '/dish-detail',
                params: { itemId: item.id, scanId: item.scanId },
              })
            }
          />
        ))}
      </ScrollView>

      <DisclaimerFooter />
    </SafeAreaView>
  );
}
