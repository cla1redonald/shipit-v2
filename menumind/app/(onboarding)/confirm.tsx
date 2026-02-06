import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useProfileStore } from '../../src/stores/profileStore';
import { ALLERGEN_LABELS, DIET_OPTIONS } from '../../src/constants';
import { Button, Card } from '../../src/components/ui';

export default function ConfirmScreen() {
  const router = useRouter();
  const draftProfile = useProfileStore((s) => s.draftProfile);
  const saveProfile = useProfileStore((s) => s.saveProfile);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    setLoading(true);
    setError('');
    try {
      await saveProfile();
      router.replace('/(tabs)/scan');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6 pt-8" contentContainerClassName="pb-8">
        <Text className="text-xs font-medium text-brand bg-brand-light px-2 py-0.5 rounded-full self-start mb-2">
          Step 5 of 5
        </Text>

        <Text className="text-2xl font-bold text-gray-900 mb-2">
          Your Dietary Profile
        </Text>
        <Text className="text-base text-gray-500 mb-6">
          Review your profile before saving.
        </Text>

        <View className="gap-4 mb-8">
          <Card>
            <Text className="text-sm font-medium text-gray-500 mb-2">Allergies</Text>
            {draftProfile.allergies.length > 0 ? (
              <View className="flex-row flex-wrap gap-2">
                {draftProfile.allergies.map((a) => (
                  <View key={a} className="bg-avoid-light px-3 py-1 rounded-full">
                    <Text className="text-sm text-avoid-dark font-medium">
                      {ALLERGEN_LABELS[a] || a}
                      {draftProfile.severityLevels[a]
                        ? ` (${draftProfile.severityLevels[a]})`
                        : ''}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-base text-gray-600">No allergies selected</Text>
            )}
          </Card>

          <Card>
            <Text className="text-sm font-medium text-gray-500 mb-2">Diet Types</Text>
            {draftProfile.dietTypes.length > 0 ? (
              <View className="flex-row flex-wrap gap-2">
                {draftProfile.dietTypes.map((d) => {
                  const option = DIET_OPTIONS.find((o) => o.value === d);
                  return (
                    <View key={d} className="bg-brand-light px-3 py-1 rounded-full">
                      <Text className="text-sm text-brand-dark font-medium">
                        {option?.label || d}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ) : (
              <Text className="text-base text-gray-600">No specific diet</Text>
            )}
          </Card>

          {draftProfile.customRestrictions.length > 0 && (
            <Card>
              <Text className="text-sm font-medium text-gray-500 mb-2">
                Custom Restrictions
              </Text>
              {draftProfile.customRestrictions.map((r, i) => (
                <Text key={i} className="text-base text-gray-700">
                  • {r}
                </Text>
              ))}
            </Card>
          )}
        </View>

        {error ? (
          <Text className="text-avoid text-sm mb-4 text-center">{error}</Text>
        ) : null}

        <View className="gap-3">
          <Button
            title="Save & Start Scanning"
            onPress={handleSave}
            loading={loading}
          />
          <Button title="Back" variant="secondary" onPress={() => router.back()} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
