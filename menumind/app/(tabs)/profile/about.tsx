import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AboutScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.logoSection}>
          <View style={styles.logoBox}>
            <Text style={styles.logoEmoji}>🍽️</Text>
          </View>
          <Text style={styles.appName}>MenuMind</Text>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>

        <Text style={styles.description}>
          MenuMind uses AI to analyze restaurant menus and classify dishes based on
          your dietary profile. Snap a photo of any menu — printed, handwritten, or in
          any language — and get instant safety classifications.
        </Text>

        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerTitle}>
            Health Disclaimer
          </Text>
          <Text style={styles.disclaimerBody}>
            MenuMind is an informational aid, NOT a medical device. AI analysis may
            contain errors. Hidden ingredients, cross-contamination, and kitchen
            practices cannot be detected from a menu photo alone. Always confirm
            ingredients with your server, especially for severe allergies. MenuMind
            cannot guarantee the accuracy of its analysis and is not liable for
            allergic reactions or adverse health events.
          </Text>
        </View>

        <View style={styles.linksSection}>
          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => router.push('/(tabs)/profile/privacy-policy')}
          >
            <Text style={styles.linkText}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => router.push('/(tabs)/profile/terms')}
          >
            <Text style={styles.linkText}>Terms of Service</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.poweredBy}>
          Powered by Claude AI
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  backButton: {
    marginBottom: 16,
  },
  backText: {
    color: '#10B981',
    fontWeight: '500',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoBox: {
    width: 80,
    height: 80,
    backgroundColor: '#10B981',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoEmoji: {
    fontSize: 36,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  versionText: {
    fontSize: 14,
    color: '#6B7280',
  },
  description: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 24,
  },
  disclaimerBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  disclaimerBody: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  linksSection: {
    gap: 12,
  },
  linkItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  linkText: {
    fontSize: 16,
    color: '#10B981',
  },
  poweredBy: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 32,
  },
});
