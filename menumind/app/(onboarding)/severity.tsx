import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProfileStore } from '../../src/stores/profileStore';
import { ALLERGEN_LABELS } from '../../src/constants';
import { Button } from '../../src/components/ui';
import type { SeverityLevel } from '../../src/types';

const SEVERITY_OPTIONS: { value: SeverityLevel; label: string; color: string }[] = [
  { value: 'mild', label: 'Mild', color: 'bg-caution-light text-caution-dark border-caution' },
  { value: 'moderate', label: 'Moderate', color: 'bg-orange-100 text-orange-800 border-orange-400' },
  { value: 'severe', label: 'Severe', color: 'bg-avoid-light text-avoid-dark border-avoid' },
];

export default function SeverityScreen() {
  const router = useRouter();
  const draftProfile = useProfileStore((s) => s.draftProfile);
  const setDraftSeverity = useProfileStore((s) => s.setDraftSeverity);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6 pt-8" contentContainerClassName="pb-8">
        <Text className="text-xs font-medium text-brand bg-brand-light px-2 py-0.5 rounded-full self-start mb-2">
          Step 3 of 5
        </Text>

        <Text className="text-2xl font-bold text-gray-900 mb-2">
          How severe are your allergies?
        </Text>
        <Text className="text-base text-gray-500 mb-6">
          This helps us calibrate our warnings.
        </Text>

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
                        isSelected ? option.color : 'bg-white border-gray-200'
                      }`}
                      onPress={() => setDraftSeverity(allergen, option.value)}
                      activeOpacity={0.7}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          isSelected ? '' : 'text-gray-500'
                        }`}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </View>

        <View className="gap-3">
          <Button
            title="Next"
            onPress={() => router.push('/(onboarding)/custom-restrictions')}
          />
          <Button title="Back" variant="secondary" onPress={() => router.back()} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
