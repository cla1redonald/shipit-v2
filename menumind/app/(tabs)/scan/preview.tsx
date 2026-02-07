import { View, Text, Image, StyleSheet } from 'react-native';
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
      <SafeAreaView style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No image selected</Text>
        <Button title="Go Back" variant="text" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: currentScan.imageUri }}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}

      <View style={styles.actions}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#6B7280',
  },
  imageWrapper: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  image: {
    flex: 1,
    borderRadius: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 24,
    marginTop: 8,
  },
  actions: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
    gap: 12,
  },
});
