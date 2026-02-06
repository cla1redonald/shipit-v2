import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { useScanStore } from '../../../src/stores/scanStore';
import { LoadingOverlay } from '../../../src/components/ui';
import { Button } from '../../../src/components/ui';

export default function AnalyzingScreen() {
  const router = useRouter();
  const status = useScanStore((s) => s.currentScan.status);
  const error = useScanStore((s) => s.currentScan.error);
  const cancelScan = useScanStore((s) => s.cancelScan);

  useEffect(() => {
    if (status === 'complete') {
      router.replace('/(tabs)/scan/results');
    }
  }, [status]);

  if (status === 'error') {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
        <View className="items-center">
          <View className="text-5xl mb-4">❌</View>
          <Button title="Try Again" onPress={() => router.replace('/(tabs)/scan')} />
          <View className="mt-3 w-full">
            <Button
              title="Cancel"
              variant="text"
              onPress={() => {
                cancelScan();
                router.replace('/(tabs)/scan');
              }}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <LoadingOverlay />
      <View className="px-6 pb-8">
        <Button
          title="Cancel"
          variant="text"
          onPress={() => {
            cancelScan();
            router.replace('/(tabs)/scan');
          }}
        />
      </View>
    </SafeAreaView>
  );
}
