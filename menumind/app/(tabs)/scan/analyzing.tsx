import { View, Text, StyleSheet } from 'react-native';
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
      <SafeAreaView style={styles.errorContainer}>
        <View style={styles.errorContent}>
          <Text style={styles.errorEmoji}>❌</Text>
          <Text style={styles.errorTitle}>Analysis Failed</Text>
          {error ? (
            <Text style={styles.errorMessage}>{error}</Text>
          ) : null}
          <View style={styles.errorActions}>
            <Button title="Try Again" onPress={() => router.replace('/(tabs)/scan')} />
            <View style={styles.cancelButtonWrapper}>
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
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LoadingOverlay />
      <View style={styles.bottomArea}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorContent: {
    alignItems: 'center',
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  errorActions: {
    width: '100%',
  },
  cancelButtonWrapper: {
    marginTop: 12,
    width: '100%',
  },
  bottomArea: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
});
