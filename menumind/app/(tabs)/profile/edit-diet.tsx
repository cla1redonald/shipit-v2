import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useProfileStore } from '../../../src/stores/profileStore';
import { DIET_OPTIONS } from '../../../src/constants';
import { Button, ChipSelector } from '../../../src/components/ui';
import type { DietType } from '../../../src/types';

export default function EditDietScreen() {
  const router = useRouter();
  const draftProfile = useProfileStore((s) => s.draftProfile);
  const setDraftDietTypes = useProfileStore((s) => s.setDraftDietTypes);
  const saveProfile = useProfileStore((s) => s.saveProfile);
  const [loading, setLoading] = useState(false);

  function handleToggle(value: DietType) {
    const current = draftProfile.dietTypes;
    if (current.includes(value)) {
      setDraftDietTypes(current.filter((d) => d !== value));
    } else {
      setDraftDietTypes([...current, value]);
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

        <Text className="text-2xl font-bold text-gray-900 mb-6">Edit Diet Types</Text>

        <ChipSelector
          options={DIET_OPTIONS.map((d) => ({ value: d.value, label: d.label }))}
          selected={draftProfile.dietTypes}
          onToggle={handleToggle}
        />

        <View className="mt-8">
          <Button title="Save Changes" onPress={handleSave} loading={loading} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
