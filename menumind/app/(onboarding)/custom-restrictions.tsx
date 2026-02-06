import { View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useProfileStore } from '../../src/stores/profileStore';
import { Button } from '../../src/components/ui';

export default function CustomRestrictionsScreen() {
  const router = useRouter();
  const draftProfile = useProfileStore((s) => s.draftProfile);
  const setDraftCustomRestrictions = useProfileStore((s) => s.setDraftCustomRestrictions);
  const [text, setText] = useState(draftProfile.customRestrictions.join('\n'));

  function handleNext() {
    const restrictions = text
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean);
    setDraftCustomRestrictions(restrictions);
    router.push('/(onboarding)/confirm');
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6 pt-8" contentContainerClassName="pb-8">
        <Text className="text-xs font-medium text-brand bg-brand-light px-2 py-0.5 rounded-full self-start mb-2">
          Step 4 of 5
        </Text>

        <Text className="text-2xl font-bold text-gray-900 mb-2">
          Anything else we should know?
        </Text>
        <Text className="text-base text-gray-500 mb-6">
          Add any other dietary needs or preferences.
        </Text>

        <TextInput
          className="w-full border border-gray-200 rounded-xl px-4 py-4 text-base bg-gray-50 min-h-[120px]"
          placeholder="e.g., No cilantro, avoid spicy food, no raw fish..."
          value={text}
          onChangeText={setText}
          multiline
          textAlignVertical="top"
        />

        <View className="gap-3 mt-8">
          <Button title="Next" onPress={handleNext} />
          <Button
            title="Skip"
            variant="text"
            onPress={() => {
              setDraftCustomRestrictions([]);
              router.push('/(onboarding)/confirm');
            }}
          />
          <Button title="Back" variant="secondary" onPress={() => router.back()} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
