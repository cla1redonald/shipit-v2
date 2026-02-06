import { View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useProfileStore } from '../../../src/stores/profileStore';
import { COMMON_ALLERGENS } from '../../../src/constants';
import { Button, ChipSelector } from '../../../src/components/ui';

export default function EditAllergiesScreen() {
  const router = useRouter();
  const draftProfile = useProfileStore((s) => s.draftProfile);
  const setDraftAllergies = useProfileStore((s) => s.setDraftAllergies);
  const saveProfile = useProfileStore((s) => s.saveProfile);
  const [loading, setLoading] = useState(false);
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

  async function handleSave() {
    setLoading(true);
    try {
      await saveProfile();
      router.back();
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6 pt-6" contentContainerClassName="pb-8">
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Text className="text-brand font-medium">← Back</Text>
        </TouchableOpacity>

        <Text className="text-2xl font-bold text-gray-900 mb-6">Edit Allergies</Text>

        <ChipSelector
          options={COMMON_ALLERGENS}
          selected={draftProfile.allergies}
          onToggle={handleToggle}
        />

        <View className="flex-row items-center gap-2 mt-6 mb-8">
          <TextInput
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-base bg-gray-50"
            placeholder="Add another..."
            value={customAllergen}
            onChangeText={setCustomAllergen}
            onSubmitEditing={addCustom}
          />
          <TouchableOpacity className="bg-brand px-4 py-3 rounded-xl" onPress={addCustom}>
            <Text className="text-white font-semibold">Add</Text>
          </TouchableOpacity>
        </View>

        <Button title="Save Changes" onPress={handleSave} loading={loading} />
      </ScrollView>
    </SafeAreaView>
  );
}
