import { View, Text, ScrollView, RefreshControl } from 'react-native';
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
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <View className="bg-white px-6 pt-4 pb-3 border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900">Scan History</Text>
      </View>

      {history.length === 0 && !historyLoading ? (
        <EmptyState
          title="No scans yet"
          description="Scan your first menu to see it here!"
        />
      ) : (
        <ScrollView
          className="flex-1 px-4 pt-3"
          contentContainerClassName="pb-4 gap-3"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" />
          }
        >
          {history.map((scan) => (
            <Card
              key={scan.id}
              onPress={() => router.push(`/(tabs)/history/${scan.id}`)}
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900">
                    {scan.restaurantName || 'Menu Scan'}
                  </Text>
                  <Text className="text-sm text-gray-500 mt-0.5">
                    {format(new Date(scan.createdAt), 'MMM d, yyyy · h:mm a')}
                  </Text>
                </View>
                <Text className="text-sm text-gray-500">
                  {scan.itemCount} dishes
                </Text>
              </View>

              <View className="flex-row gap-3 mt-3">
                <View className="flex-row items-center gap-1">
                  <View className="w-2.5 h-2.5 rounded-full bg-safe" />
                  <Text className="text-xs text-gray-600">{scan.safeCount} safe</Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <View className="w-2.5 h-2.5 rounded-full bg-caution" />
                  <Text className="text-xs text-gray-600">{scan.cautionCount} caution</Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <View className="w-2.5 h-2.5 rounded-full bg-avoid" />
                  <Text className="text-xs text-gray-600">{scan.avoidCount} avoid</Text>
                </View>
              </View>
            </Card>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
