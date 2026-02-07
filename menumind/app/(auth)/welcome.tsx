import { View, Text, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../../src/components/ui';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <LinearGradient colors={['#F0F7F4', '#D1FAE5', '#ECFDF5']} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContent}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>🍽️</Text>
          </View>
          <Text style={styles.title}>
            MenuMind
          </Text>
          <Text style={styles.subtitle}>
            Snap a menu. Know what's safe.
          </Text>
          <Text style={styles.description}>
            AI-powered menu analysis for your dietary needs. Works on any menu, any language.
          </Text>
        </View>

        <View style={styles.buttonGroup}>
          <Button
            title="Get Started"
            onPress={() => router.push('/(auth)/sign-up')}
          />
          <Button
            title="I Already Have an Account"
            variant="outline"
            onPress={() => router.push('/(auth)/sign-in')}
          />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 32,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 96,
    height: 96,
    backgroundColor: '#10B981',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  iconText: {
    fontSize: 48,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: '#4B5563',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 32,
    marginTop: 16,
  },
  buttonGroup: {
    gap: 12,
  },
});
