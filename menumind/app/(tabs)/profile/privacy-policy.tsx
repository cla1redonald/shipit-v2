import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.pageTitle}>Privacy Policy</Text>

        <Text style={styles.dateText}>Last updated: February 2026</Text>

        <View style={styles.sectionsContainer}>
          <View>
            <Text style={styles.sectionTitle}>Data We Collect</Text>
            <Text style={styles.sectionBody}>
              We collect your email address for authentication, your dietary profile
              (allergies, diet types, severity levels), and menu photos you scan for analysis.
              All data is stored securely on Supabase with encryption at rest.
            </Text>
          </View>

          <View>
            <Text style={styles.sectionTitle}>How We Use Your Data</Text>
            <Text style={styles.sectionBody}>
              Your dietary profile is used solely to analyze menu photos and provide
              personalized safety classifications. Menu photos are sent to our AI
              analysis service and stored for your scan history. We do not sell,
              share, or use your data for advertising.
            </Text>
          </View>

          <View>
            <Text style={styles.sectionTitle}>Data Storage & Security</Text>
            <Text style={styles.sectionBody}>
              All data is encrypted at rest and in transit. Your dietary profile is
              treated as sensitive health information. Authentication tokens are
              stored in iOS Keychain. We use row-level security to ensure users can
              only access their own data.
            </Text>
          </View>

          <View>
            <Text style={styles.sectionTitle}>Data Deletion</Text>
            <Text style={styles.sectionBody}>
              You can delete your account at any time from the Profile screen. This
              permanently removes all your data including your profile, scan history,
              menu photos, and authentication credentials. This action is irreversible.
            </Text>
          </View>

          <View>
            <Text style={styles.sectionTitle}>Third-Party Services</Text>
            <Text style={styles.sectionBody}>
              We use Supabase for data storage and authentication, and Anthropic's
              Claude API for AI menu analysis. Menu photos are processed by Claude's
              API to generate safety classifications. Please review Anthropic's
              privacy policy for information about how they handle data.
            </Text>
          </View>

          <View>
            <Text style={styles.sectionTitle}>Contact</Text>
            <Text style={styles.sectionBody}>
              For privacy-related questions, contact us at privacy@menumind.app.
            </Text>
          </View>
        </View>
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
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24,
  },
  dateText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  sectionsContainer: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  sectionBody: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});
