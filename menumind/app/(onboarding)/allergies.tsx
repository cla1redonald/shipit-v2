import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.stepRow}>
          <Text style={styles.stepBadge}>
            Step 1 of 5
          </Text>
        </View>

        <Text style={styles.title}>
          What are you allergic to?
        </Text>
        <Text style={styles.subtitle}>
          Select all that apply. You can change these later.
        </Text>

        <ChipSelector
          options={COMMON_ALLERGENS}
          selected={draftProfile.allergies}
          onToggle={handleToggle}
        />

        <View style={styles.customInputRow}>
          <TextInput
            style={styles.textInput}
            placeholder="Add another allergen..."
            value={customAllergen}
            onChangeText={setCustomAllergen}
            onSubmitEditing={addCustom}
            returnKeyType="done"
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={addCustom}
            disabled={!customAllergen.trim()}
          >
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        {draftProfile.allergies.filter(
          (a) => !COMMON_ALLERGENS.some((c) => c.value === a)
        ).length > 0 && (
          <View style={styles.customSection}>
            <Text style={styles.customLabel}>Custom allergens:</Text>
            <View style={styles.chipRow}>
              {draftProfile.allergies
                .filter((a) => !COMMON_ALLERGENS.some((c) => c.value === a))
                .map((a) => (
                  <TouchableOpacity
                    key={a}
                    style={styles.customChip}
                    onPress={() => handleToggle(a)}
                  >
                    <Text style={styles.customChipText}>{a}</Text>
                    <Text style={styles.customChipClose}>✕</Text>
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
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  stepBadge: {
    fontSize: 12,
    fontWeight: '500',
    color: '#10B981',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
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
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    marginBottom: 32,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  addButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  customSection: {
    marginBottom: 24,
  },
  customLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  customChip: {
    backgroundColor: '#10B981',
    borderWidth: 1,
    borderColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  customChipText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  customChipClose: {
    color: '#FFFFFF',
    fontSize: 12,
  },
});
