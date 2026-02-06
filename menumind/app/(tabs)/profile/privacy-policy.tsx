import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6 pt-6" contentContainerClassName="pb-8">
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Text className="text-brand font-medium">← Back</Text>
        </TouchableOpacity>

        <Text className="text-2xl font-bold text-gray-900 mb-6">Privacy Policy</Text>

        <Text className="text-sm text-gray-500 mb-4">Last updated: February 2026</Text>

        <View className="gap-4">
          <View>
            <Text className="text-base font-semibold text-gray-900 mb-1">Data We Collect</Text>
            <Text className="text-sm text-gray-700 leading-5">
              We collect your email address for authentication, your dietary profile
              (allergies, diet types, severity levels), and menu photos you scan for analysis.
              All data is stored securely on Supabase with encryption at rest.
            </Text>
          </View>

          <View>
            <Text className="text-base font-semibold text-gray-900 mb-1">How We Use Your Data</Text>
            <Text className="text-sm text-gray-700 leading-5">
              Your dietary profile is used solely to analyze menu photos and provide
              personalized safety classifications. Menu photos are sent to our AI
              analysis service and stored for your scan history. We do not sell,
              share, or use your data for advertising.
            </Text>
          </View>

          <View>
            <Text className="text-base font-semibold text-gray-900 mb-1">Data Storage & Security</Text>
            <Text className="text-sm text-gray-700 leading-5">
              All data is encrypted at rest and in transit. Your dietary profile is
              treated as sensitive health information. Authentication tokens are
              stored in iOS Keychain. We use row-level security to ensure users can
              only access their own data.
            </Text>
          </View>

          <View>
            <Text className="text-base font-semibold text-gray-900 mb-1">Data Deletion</Text>
            <Text className="text-sm text-gray-700 leading-5">
              You can delete your account at any time from the Profile screen. This
              permanently removes all your data including your profile, scan history,
              menu photos, and authentication credentials. This action is irreversible.
            </Text>
          </View>

          <View>
            <Text className="text-base font-semibold text-gray-900 mb-1">Third-Party Services</Text>
            <Text className="text-sm text-gray-700 leading-5">
              We use Supabase for data storage and authentication, and Anthropic's
              Claude API for AI menu analysis. Menu photos are processed by Claude's
              API to generate safety classifications. Please review Anthropic's
              privacy policy for information about how they handle data.
            </Text>
          </View>

          <View>
            <Text className="text-base font-semibold text-gray-900 mb-1">Contact</Text>
            <Text className="text-sm text-gray-700 leading-5">
              For privacy-related questions, contact us at privacy@menumind.app.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
