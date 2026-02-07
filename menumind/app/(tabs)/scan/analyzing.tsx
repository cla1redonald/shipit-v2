import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { useScanStore } from '../../../src/stores/scanStore';
import { LoadingOverlay } from '../../../src/components/ui';
import { Button } from '../../../src/components/ui';

export default function AnalyzingScreen() {
  const router = useRouter();
  const status = useScanStore((s) => s.currentScan.status);
  const error = useScanStore((s) => s.currentScan.error);
  const debugLogs = useScanStore((s) => s.currentScan.debugLogs);
  const cancelScan = useScanStore((s) => s.cancelScan);
  const [showDebug, setShowDebug] = useState(false);

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

          {debugLogs.length > 0 ? (
            <View style={styles.debugSection}>
              <Text
                style={styles.debugToggle}
                onPress={() => setShowDebug(!showDebug)}
              >
                {showDebug ? '▼ Hide Debug Log' : '▶ Show Debug Log'}
              </Text>
              {showDebug ? (
                <ScrollView style={styles.debugScroll}>
                  {debugLogs.map((log, i) => (
                    <Text key={i} style={styles.debugLine}>{log}</Text>
                  ))}
                </ScrollView>
              ) : null}
            </View>
          ) : null}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LoadingOverlay />

      {debugLogs.length > 0 ? (
        <View style={styles.liveDebug}>
          <ScrollView style={styles.liveDebugScroll}>
            {debugLogs.map((log, i) => (
              <Text key={i} style={styles.liveDebugLine}>{log}</Text>
            ))}
          </ScrollView>
        </View>
      ) : null}

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
    width: '100%',
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
  // Debug console (on error)
  debugSection: {
    marginTop: 24,
    width: '100%',
  },
  debugToggle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 8,
  },
  debugScroll: {
    maxHeight: 200,
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
  },
  debugLine: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#D1D5DB',
    lineHeight: 18,
  },
  // Live debug (while analyzing)
  liveDebug: {
    marginHorizontal: 24,
    marginBottom: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    maxHeight: 120,
  },
  liveDebugScroll: {
    maxHeight: 96,
  },
  liveDebugLine: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#374151',
    lineHeight: 16,
  },
});
