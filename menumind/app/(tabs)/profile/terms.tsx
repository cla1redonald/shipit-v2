import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TermsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.pageTitle}>Terms of Service</Text>

        <Text style={styles.dateText}>Last updated: February 2026</Text>

        <View style={styles.sectionsContainer}>
          <View>
            <Text style={styles.sectionTitle}>Acceptance of Terms</Text>
            <Text style={styles.sectionBody}>
              By using MenuMind, you agree to these terms of service. If you do not
              agree, please do not use the app.
            </Text>
          </View>

          <View>
            <Text style={styles.sectionTitle}>Service Description</Text>
            <Text style={styles.sectionBody}>
              MenuMind provides AI-powered analysis of restaurant menu photos to
              classify dishes based on your dietary profile. This is an informational
              aid only and does not constitute medical advice.
            </Text>
          </View>

          <View>
            <Text style={styles.sectionTitle}>Disclaimer of Warranties</Text>
            <Text style={styles.sectionBody}>
              MenuMind is provided "as is" without warranties of any kind. We do not
              guarantee the accuracy, completeness, or reliability of AI analysis
              results. AI may produce incorrect results including failing to identify
              allergens present in a dish.
            </Text>
          </View>

          <View>
            <Text style={styles.sectionTitle}>Limitation of Liability</Text>
            <Text style={styles.sectionBody}>
              MenuMind and its creators are not liable for any allergic reactions,
              adverse health events, or other damages resulting from reliance on the
              app's analysis. You are solely responsible for confirming ingredients
              with restaurant staff before consuming food.
            </Text>
          </View>

          <View>
            <Text style={styles.sectionTitle}>User Responsibilities</Text>
            <Text style={styles.sectionBody}>
              You are responsible for: (1) maintaining accurate dietary profile
              information, (2) always confirming ingredients with restaurant staff
              especially for severe allergies, (3) understanding that AI analysis is
              probabilistic and may contain errors, (4) not relying solely on
              MenuMind for food safety decisions.
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
