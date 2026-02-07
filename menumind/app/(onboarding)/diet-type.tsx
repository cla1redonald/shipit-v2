import { View, Text, ScrollView, StyleSheet } from 'react-native';
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.stepBadge}>
          Step 2 of 5
        </Text>

        <Text style={styles.title}>
          Do you follow a specific diet?
        </Text>
        <Text style={styles.subtitle}>
          Optional. Select one or more.
        </Text>

        <ChipSelector
          options={DIET_OPTIONS.map((d) => ({ value: d.value, label: d.label }))}
          selected={draftProfile.dietTypes}
          onToggle={handleToggle}
        />

        <View style={styles.descriptionsContainer}>
          {DIET_OPTIONS.filter((d) => draftProfile.dietTypes.includes(d.value)).map((d) => (
            <Text key={d.value} style={styles.descriptionText}>
              {d.label}: {d.description}
            </Text>
          ))}
        </View>

        <View style={styles.buttonGroup}>
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  stepBadge: {
    fontSize: 12,
    fontWeight: '500',
    color: '#10B981',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
    alignSelf: 'flex-start',
    marginBottom: 8,
    overflow: 'hidden',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
  },
  descriptionsContainer: {
    marginTop: 16,
    marginBottom: 32,
  },
  descriptionText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  buttonGroup: {
    gap: 12,
  },
});
