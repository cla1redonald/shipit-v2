import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { useScanStore } from '../../../src/stores/scanStore';
import { DishCard, DisclaimerFooter } from '../../../src/components/ui';
import type { ScanItem, DishClassification } from '../../../src/types';

type Filter = 'all' | DishClassification;

export default function HistoryDetailScreen() {
  const router = useRouter();
  const { scanId } = useLocalSearchParams<{ scanId: string }>();
  const fetchScanItems = useScanStore((s) => s.fetchScanItems);
  const [items, setItems] = useState<ScanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    if (scanId) {
      fetchScanItems(scanId)
        .then(setItems)
        .finally(() => setLoading(false));
    }
  }, [scanId]);

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

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#10B981" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <View className="bg-white px-6 pt-4 pb-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mb-2">
          <Text className="text-brand font-medium">← Back</Text>
        </TouchableOpacity>

        <Text className="text-sm text-gray-500 mb-2">
          {counts.safe} safe, {counts.caution} caution, {counts.avoid} avoid
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
