import { View, Text, StyleSheet } from 'react-native';
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <Text style={styles.title}>Ready to scan</Text>
        <Text style={styles.subtitle}>
          Point your camera at any menu to get started.
        </Text>

        <View style={styles.centerArea}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconEmoji}>🍽️</Text>
          </View>
          <Button
            title="Scan Menu"
            onPress={() => router.push('/(tabs)/scan/camera')}
          />
          <View style={styles.buttonWrapper}>
            <Button
              title="Choose from Photos"
              variant="outline"
              onPress={handlePickImage}
            />
          </View>
        </View>

        {history.length > 0 && (
          <Card style={styles.recentCard} onPress={() => router.push('/(tabs)/history')}>
            <Text style={styles.recentLabel}>Most Recent Scan</Text>
            <Text style={styles.recentName}>
              {history[0].restaurantName || 'Menu scan'}
            </Text>
            <Text style={styles.recentCount}>
              {history[0].itemCount} dishes analyzed
            </Text>
          </Card>
        )}
      </View>
      <DisclaimerFooter />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
  },
  centerArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 160,
    height: 160,
    backgroundColor: '#D1FAE5',
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  iconEmoji: {
    fontSize: 60,
  },
  buttonWrapper: {
    marginTop: 12,
    width: '100%',
  },
  recentCard: {
    marginBottom: 16,
  },
  recentLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  recentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 4,
  },
  recentCount: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
});
