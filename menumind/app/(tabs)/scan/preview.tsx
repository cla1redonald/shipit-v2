import { View, Text, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useScanStore } from '../../../src/stores/scanStore';
import { useProfileStore } from '../../../src/stores/profileStore';
import { compressImage } from '../../../src/utils';
import { Button } from '../../../src/components/ui';

export default function PreviewScreen() {
  const router = useRouter();
  const currentScan = useScanStore((s) => s.currentScan);
  const setCompressedImage = useScanStore((s) => s.setCompressedImage);
  const startAnalysis = useScanStore((s) => s.startAnalysis);
  const draftProfile = useProfileStore((s) => s.draftProfile);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleAnalyze() {
    if (!currentScan.imageUri) return;
    setLoading(true);
    setError('');
    try {
      // Compress the image first
      const compressed = await compressImage(currentScan.imageUri);
      setCompressedImage(compressed);

      // Navigate to analyzing screen
      router.push('/(tabs)/scan/analyzing');

      // Start the analysis
      await startAnalysis(draftProfile);

      // Navigate to results
      router.replace('/(tabs)/scan/results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze menu');
      setLoading(false);
    }
  }

  if (!currentScan.imageUri) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-500">No image selected</Text>
        <Button title="Go Back" variant="text" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-4 pt-4">
        <Image
          source={{ uri: currentScan.imageUri }}
          className="flex-1 rounded-2xl"
          resizeMode="contain"
        />
      </View>

      {error ? (
        <Text className="text-avoid text-sm text-center px-6 mt-2">{error}</Text>
      ) : null}

      <View className="px-6 pb-8 pt-4 gap-3">
        <Button
          title="Analyze This Menu"
          onPress={handleAnalyze}
          loading={loading}
        />
        <Button
          title="Retake"
          variant="secondary"
          onPress={() => {
            router.back();
          }}
        />
      </View>
    </SafeAreaView>
  );
}
