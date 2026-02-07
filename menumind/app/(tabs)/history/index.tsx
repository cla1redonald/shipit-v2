import { View, Text, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useCallback, useState } from 'react';
import { format } from 'date-fns';
import { useScanStore } from '../../../src/stores/scanStore';
import { Card, EmptyState } from '../../../src/components/ui';

export default function HistoryScreen() {
  const router = useRouter();
  const history = useScanStore((s) => s.history);
  const historyLoading = useScanStore((s) => s.historyLoading);
  const fetchHistory = useScanStore((s) => s.fetchHistory);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Scan History</Text>
      </View>

      {history.length === 0 && !historyLoading ? (
        <EmptyState
          title="No scans yet"
          description="Scan your first menu to see it here!"
        />
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" />
          }
        >
          {history.map((scan) => (
            <Card
              key={scan.id}
              onPress={() => router.push(`/(tabs)/history/${scan.id}`)}
            >
              <View style={styles.cardRow}>
                <View style={styles.cardLeft}>
                  <Text style={styles.cardTitle}>
                    {scan.restaurantName || 'Menu Scan'}
                  </Text>
                  <Text style={styles.cardDate}>
                    {format(new Date(scan.createdAt), 'MMM d, yyyy · h:mm a')}
                  </Text>
                </View>
                <Text style={styles.cardCount}>
                  {scan.itemCount} dishes
                </Text>
              </View>

              <View style={styles.countsRow}>
                <View style={styles.countItem}>
                  <View style={[styles.countDot, styles.safeDot]} />
                  <Text style={styles.countText}>{scan.safeCount} safe</Text>
                </View>
                <View style={styles.countItem}>
                  <View style={[styles.countDot, styles.cautionDot]} />
                  <Text style={styles.countText}>{scan.cautionCount} caution</Text>
                </View>
                <View style={styles.countItem}>
                  <View style={[styles.countDot, styles.avoidDot]} />
                  <Text style={styles.countText}>{scan.avoidCount} avoid</Text>
                </View>
              </View>
            </Card>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
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
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardLeft: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  cardDate: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  cardCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  countsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  countItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  countDot: {
    width: 10,
    height: 10,
    borderRadius: 9999,
  },
  safeDot: {
    backgroundColor: '#22C55E',
  },
  cautionDot: {
    backgroundColor: '#F59E0B',
  },
  avoidDot: {
    backgroundColor: '#EF4444',
  },
  countText: {
    fontSize: 12,
    color: '#4B5563',
  },
});
