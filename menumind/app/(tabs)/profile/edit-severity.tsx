import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useProfileStore } from '../../../src/stores/profileStore';
import { ALLERGEN_LABELS } from '../../../src/constants';
import { Button } from '../../../src/components/ui';
import type { SeverityLevel } from '../../../src/types';

const SEVERITY_OPTIONS: { value: SeverityLevel; label: string }[] = [
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' },
];

export default function EditSeverityScreen() {
  const router = useRouter();
  const draftProfile = useProfileStore((s) => s.draftProfile);
  const setDraftSeverity = useProfileStore((s) => s.setDraftSeverity);
  const saveProfile = useProfileStore((s) => s.saveProfile);
  const [loading, setLoading] = useState(false);

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

        <Text className="text-2xl font-bold text-gray-900 mb-6">Edit Severity Levels</Text>

        <View className="gap-4 mb-8">
          {draftProfile.allergies.map((allergen) => (
            <View key={allergen} className="bg-gray-50 rounded-xl p-4">
              <Text className="text-base font-semibold text-gray-900 mb-3">
                {ALLERGEN_LABELS[allergen] || allergen}
              </Text>
              <View className="flex-row gap-2">
                {SEVERITY_OPTIONS.map((option) => {
                  const isSelected = draftProfile.severityLevels[allergen] === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      className={`flex-1 py-2 rounded-lg border items-center ${
                        isSelected ? 'bg-brand border-brand' : 'bg-white border-gray-200'
                      }`}
                      onPress={() => setDraftSeverity(allergen, option.value)}
                    >
                      <Text className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-500'}`}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </View>

        <Button title="Save Changes" onPress={handleSave} loading={loading} />
      </ScrollView>
    </SafeAreaView>
  );
}
