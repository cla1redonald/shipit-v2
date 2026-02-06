import { View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useProfileStore } from '../../src/stores/profileStore';
import { COMMON_ALLERGENS } from '../../src/constants';
import { Button, ChipSelector } from '../../src/components/ui';

export default function AllergiesScreen() {
  const router = useRouter();
  const draftProfile = useProfileStore((s) => s.draftProfile);
  const setDraftAllergies = useProfileStore((s) => s.setDraftAllergies);
  const [customAllergen, setCustomAllergen] = useState('');

  function handleToggle(value: string) {
    const current = draftProfile.allergies;
    if (current.includes(value)) {
      setDraftAllergies(current.filter((a) => a !== value));
    } else {
      setDraftAllergies([...current, value]);
    }
  }

  function addCustom() {
    const trimmed = customAllergen.trim();
    if (trimmed && !draftProfile.allergies.includes(trimmed.toLowerCase())) {
      setDraftAllergies([...draftProfile.allergies, trimmed.toLowerCase()]);
      setCustomAllergen('');
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6 pt-8" contentContainerClassName="pb-8">
        <View className="flex-row items-center gap-2 mb-2">
          <Text className="text-xs font-medium text-brand bg-brand-light px-2 py-0.5 rounded-full">
            Step 1 of 5
          </Text>
        </View>

        <Text className="text-2xl font-bold text-gray-900 mb-2">
          What are you allergic to?
        </Text>
        <Text className="text-base text-gray-500 mb-6">
          Select all that apply. You can change these later.
        </Text>

        <ChipSelector
          options={COMMON_ALLERGENS}
          selected={draftProfile.allergies}
          onToggle={handleToggle}
        />

        <View className="flex-row items-center gap-2 mt-6 mb-8">
          <TextInput
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-base bg-gray-50"
            placeholder="Add another allergen..."
            value={customAllergen}
            onChangeText={setCustomAllergen}
            onSubmitEditing={addCustom}
            returnKeyType="done"
          />
          <TouchableOpacity
            className="bg-brand px-4 py-3 rounded-xl"
            onPress={addCustom}
            disabled={!customAllergen.trim()}
          >
            <Text className="text-white font-semibold">Add</Text>
          </TouchableOpacity>
        </View>

        {draftProfile.allergies.filter(
          (a) => !COMMON_ALLERGENS.some((c) => c.value === a)
        ).length > 0 && (
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-600 mb-2">Custom allergens:</Text>
            <View className="flex-row flex-wrap gap-2">
              {draftProfile.allergies
                .filter((a) => !COMMON_ALLERGENS.some((c) => c.value === a))
                .map((a) => (
                  <TouchableOpacity
                    key={a}
                    className="bg-brand border border-brand px-3 py-1.5 rounded-full flex-row items-center gap-1"
                    onPress={() => handleToggle(a)}
                  >
                    <Text className="text-white text-sm">{a}</Text>
                    <Text className="text-white text-xs">✕</Text>
                  </TouchableOpacity>
                ))}
            </View>
          </View>
        )}

        <Button
          title="Next"
          onPress={() => router.push('/(onboarding)/diet-type')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
