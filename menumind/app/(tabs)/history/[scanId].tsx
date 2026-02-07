import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
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
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.summaryText}>
          {counts.safe} safe, {counts.caution} caution, {counts.avoid} avoid
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filters.map((f) => (
            <TouchableOpacity
              key={f.value}
              style={[
                styles.filterChip,
                filter === f.value ? styles.filterChipActive : styles.filterChipInactive,
              ]}
              onPress={() => setFilter(f.value)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filter === f.value ? styles.filterChipTextActive : styles.filterChipTextInactive,
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    marginBottom: 8,
  },
  backText: {
    color: '#10B981',
    fontWeight: '500',
  },
  summaryText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#10B981',
  },
  filterChipInactive: {
    backgroundColor: '#F3F4F6',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  filterChipTextInactive: {
    color: '#4B5563',
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  listContent: {
    paddingBottom: 16,
    gap: 12,
  },
});
