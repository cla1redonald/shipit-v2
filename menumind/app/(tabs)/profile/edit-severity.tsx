import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
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
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Edit Severity Levels</Text>

        <View style={styles.allergenList}>
          {draftProfile.allergies.map((allergen) => (
            <View key={allergen} style={styles.allergenCard}>
              <Text style={styles.allergenName}>
                {ALLERGEN_LABELS[allergen] || allergen}
              </Text>
              <View style={styles.optionsRow}>
                {SEVERITY_OPTIONS.map((option) => {
                  const isSelected = draftProfile.severityLevels[allergen] === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.optionButton,
                        isSelected ? styles.optionButtonSelected : styles.optionButtonUnselected,
                      ]}
                      onPress={() => setDraftSeverity(allergen, option.value)}
                    >
                      <Text style={[
                        styles.optionText,
                        isSelected ? styles.optionTextSelected : styles.optionTextUnselected,
                      ]}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  backButton: {
    marginBottom: 16,
  },
  backText: {
    color: '#10B981',
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24,
  },
  allergenList: {
    gap: 16,
    marginBottom: 32,
  },
  allergenCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  allergenName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  optionButtonSelected: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  optionButtonUnselected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  optionTextUnselected: {
    color: '#6B7280',
  },
});
