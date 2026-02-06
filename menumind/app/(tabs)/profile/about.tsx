import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AboutScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6 pt-6" contentContainerClassName="pb-8">
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Text className="text-brand font-medium">← Back</Text>
        </TouchableOpacity>

        <View className="items-center mb-8">
          <View className="w-20 h-20 bg-brand rounded-2xl items-center justify-center mb-4">
            <Text className="text-4xl">🍽️</Text>
          </View>
          <Text className="text-2xl font-bold text-gray-900">MenuMind</Text>
          <Text className="text-sm text-gray-500">Version 1.0.0</Text>
        </View>

        <Text className="text-base text-gray-700 mb-6">
          MenuMind uses AI to analyze restaurant menus and classify dishes based on
          your dietary profile. Snap a photo of any menu — printed, handwritten, or in
          any language — and get instant safety classifications.
        </Text>

        <View className="bg-caution-light rounded-2xl p-5 mb-6">
          <Text className="text-base font-semibold text-caution-dark mb-2">
            Health Disclaimer
          </Text>
          <Text className="text-sm text-caution-dark leading-5">
            MenuMind is an informational aid, NOT a medical device. AI analysis may
            contain errors. Hidden ingredients, cross-contamination, and kitchen
            practices cannot be detected from a menu photo alone. Always confirm
            ingredients with your server, especially for severe allergies. MenuMind
            cannot guarantee the accuracy of its analysis and is not liable for
            allergic reactions or adverse health events.
          </Text>
        </View>

        <View className="gap-3">
          <TouchableOpacity
            className="py-3 border-b border-gray-100"
            onPress={() => router.push('/(tabs)/profile/privacy-policy')}
          >
            <Text className="text-base text-brand">Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="py-3 border-b border-gray-100"
            onPress={() => router.push('/(tabs)/profile/terms')}
          >
            <Text className="text-base text-brand">Terms of Service</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-xs text-gray-400 text-center mt-8">
          Powered by Claude AI
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
