import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TermsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6 pt-6" contentContainerClassName="pb-8">
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Text className="text-brand font-medium">← Back</Text>
        </TouchableOpacity>

        <Text className="text-2xl font-bold text-gray-900 mb-6">Terms of Service</Text>

        <Text className="text-sm text-gray-500 mb-4">Last updated: February 2026</Text>

        <View className="gap-4">
          <View>
            <Text className="text-base font-semibold text-gray-900 mb-1">Acceptance of Terms</Text>
            <Text className="text-sm text-gray-700 leading-5">
              By using MenuMind, you agree to these terms of service. If you do not
              agree, please do not use the app.
            </Text>
          </View>

          <View>
            <Text className="text-base font-semibold text-gray-900 mb-1">Service Description</Text>
            <Text className="text-sm text-gray-700 leading-5">
              MenuMind provides AI-powered analysis of restaurant menu photos to
              classify dishes based on your dietary profile. This is an informational
              aid only and does not constitute medical advice.
            </Text>
          </View>

          <View>
            <Text className="text-base font-semibold text-gray-900 mb-1">Disclaimer of Warranties</Text>
            <Text className="text-sm text-gray-700 leading-5">
              MenuMind is provided "as is" without warranties of any kind. We do not
              guarantee the accuracy, completeness, or reliability of AI analysis
              results. AI may produce incorrect results including failing to identify
              allergens present in a dish.
            </Text>
          </View>

          <View>
            <Text className="text-base font-semibold text-gray-900 mb-1">Limitation of Liability</Text>
            <Text className="text-sm text-gray-700 leading-5">
              MenuMind and its creators are not liable for any allergic reactions,
              adverse health events, or other damages resulting from reliance on the
              app's analysis. You are solely responsible for confirming ingredients
              with restaurant staff before consuming food.
            </Text>
          </View>

          <View>
            <Text className="text-base font-semibold text-gray-900 mb-1">User Responsibilities</Text>
            <Text className="text-sm text-gray-700 leading-5">
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
