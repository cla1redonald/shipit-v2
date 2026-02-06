import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useScanStore } from '../../../src/stores/scanStore';
import { Button, Card, DisclaimerFooter } from '../../../src/components/ui';

export default function ScanHomeScreen() {
  const router = useRouter();
  const setImage = useScanStore((s) => s.setImage);
  const history = useScanStore((s) => s.history);

  async function handlePickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });
    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
      router.push('/(tabs)/scan/preview');
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-1 px-6 pt-8">
        <Text className="text-2xl font-bold text-gray-900 mb-1">Ready to scan</Text>
        <Text className="text-base text-gray-500 mb-8">
          Point your camera at any menu to get started.
        </Text>

        <View className="flex-1 items-center justify-center">
          <View className="w-40 h-40 bg-brand-light rounded-full items-center justify-center mb-6">
            <Text className="text-6xl">🍽️</Text>
          </View>
          <Button
            title="Scan Menu"
            onPress={() => router.push('/(tabs)/scan/camera')}
          />
          <View className="mt-3 w-full">
            <Button
              title="Choose from Photos"
              variant="outline"
              onPress={handlePickImage}
            />
          </View>
        </View>

        {history.length > 0 && (
          <Card className="mb-4" onPress={() => router.push('/(tabs)/history')}>
            <Text className="text-sm font-medium text-gray-500">Most Recent Scan</Text>
            <Text className="text-base font-semibold text-gray-900 mt-1">
              {history[0].restaurantName || 'Menu scan'}
            </Text>
            <Text className="text-sm text-gray-500 mt-0.5">
              {history[0].itemCount} dishes analyzed
            </Text>
          </Card>
        )}
      </View>
      <DisclaimerFooter />
    </SafeAreaView>
  );
}
