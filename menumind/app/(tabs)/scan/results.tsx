import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
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
      <SafeAreaView style={styles.emptyContainer}>
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            {currentScan.results?.restaurantName && (
              <Text style={styles.restaurantName}>
                {currentScan.results.restaurantName}
              </Text>
            )}
            <Text style={styles.summaryText}>
              {counts.safe} safe, {counts.caution} caution, {counts.avoid} avoid
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              resetCurrentScan();
              router.replace('/(tabs)/scan/camera');
            }}
          >
            <Text style={styles.newScanText}>New Scan</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
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
  emptyContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  summaryText: {
    fontSize: 14,
    color: '#6B7280',
  },
  newScanText: {
    color: '#10B981',
    fontWeight: '600',
    fontSize: 14,
  },
  filterRow: {
    flexDirection: 'row',
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
