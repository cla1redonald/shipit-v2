import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProfileStore } from '../../src/stores/profileStore';
import { DIET_OPTIONS } from '../../src/constants';
import { Button, ChipSelector } from '../../src/components/ui';
import type { DietType } from '../../src/types';

export default function DietTypeScreen() {
  const router = useRouter();
  const draftProfile = useProfileStore((s) => s.draftProfile);
  const setDraftDietTypes = useProfileStore((s) => s.setDraftDietTypes);

  function handleToggle(value: DietType) {
    const current = draftProfile.dietTypes;
    if (current.includes(value)) {
      setDraftDietTypes(current.filter((d) => d !== value));
    } else {
      setDraftDietTypes([...current, value]);
    }
  }

  function handleNext() {
    if (draftProfile.allergies.length > 0) {
      router.push('/(onboarding)/severity');
    } else {
      router.push('/(onboarding)/custom-restrictions');
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6 pt-8" contentContainerClassName="pb-8">
        <Text className="text-xs font-medium text-brand bg-brand-light px-2 py-0.5 rounded-full self-start mb-2">
          Step 2 of 5
        </Text>

        <Text className="text-2xl font-bold text-gray-900 mb-2">
          Do you follow a specific diet?
        </Text>
        <Text className="text-base text-gray-500 mb-6">
          Optional. Select one or more.
        </Text>

        <ChipSelector
          options={DIET_OPTIONS.map((d) => ({ value: d.value, label: d.label }))}
          selected={draftProfile.dietTypes}
          onToggle={handleToggle}
        />

        <View className="mt-4 mb-8">
          {DIET_OPTIONS.filter((d) => draftProfile.dietTypes.includes(d.value)).map((d) => (
            <Text key={d.value} className="text-sm text-gray-500 mt-1">
              {d.label}: {d.description}
            </Text>
          ))}
        </View>

        <View className="gap-3">
          <Button title="Next" onPress={handleNext} />
          <Button
            title="Back"
            variant="secondary"
            onPress={() => router.back()}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
