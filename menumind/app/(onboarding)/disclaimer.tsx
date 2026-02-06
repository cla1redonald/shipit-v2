import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useProfileStore } from '../../src/stores/profileStore';
import { Button } from '../../src/components/ui';

export default function DisclaimerScreen() {
  const router = useRouter();
  const acceptDisclaimer = useProfileStore((s) => s.acceptDisclaimer);
  const [accepted, setAccepted] = useState(false);

  function handleAccept() {
    acceptDisclaimer();
    router.push('/(onboarding)/allergies');
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6 pt-8" contentContainerClassName="pb-8">
        <View className="w-16 h-16 bg-caution-light rounded-2xl items-center justify-center mb-6">
          <Text className="text-3xl">⚠️</Text>
        </View>

        <Text className="text-2xl font-bold text-gray-900 mb-4">
          Important Health Information
        </Text>

        <View className="bg-gray-50 rounded-2xl p-5 mb-6">
          <Text className="text-base text-gray-700 leading-6">
            MenuMind uses AI to analyze restaurant menus. It is an informational aid,{' '}
            <Text className="font-bold">NOT a medical device</Text>.
          </Text>
          <Text className="text-base text-gray-700 leading-6 mt-3">
            AI analysis may contain errors. Hidden ingredients, cross-contamination, and kitchen practices cannot be detected from a menu photo alone.
          </Text>
          <Text className="text-base text-gray-700 leading-6 mt-3 font-semibold">
            Always confirm ingredients with your server, especially for severe allergies.
          </Text>
          <Text className="text-base text-gray-700 leading-6 mt-3">
            MenuMind cannot guarantee the accuracy of its analysis and is not liable for allergic reactions or adverse health events.
          </Text>
        </View>

        <TouchableOpacity
          className="flex-row items-start gap-3 mb-8"
          onPress={() => setAccepted(!accepted)}
          activeOpacity={0.7}
        >
          <View
            className={`w-6 h-6 rounded-md border-2 items-center justify-center mt-0.5 ${
              accepted ? 'bg-brand border-brand' : 'border-gray-300'
            }`}
          >
            {accepted && <Text className="text-white text-xs font-bold">✓</Text>}
          </View>
          <Text className="flex-1 text-sm text-gray-700 leading-5">
            I understand that MenuMind is an aid and not a substitute for confirming
            ingredients with restaurant staff.
          </Text>
        </TouchableOpacity>

        <Button
          title="Continue"
          onPress={handleAccept}
          disabled={!accepted}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
