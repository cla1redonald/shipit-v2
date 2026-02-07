import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProfileStore } from '../../src/stores/profileStore';
import { ALLERGEN_LABELS } from '../../src/constants';
import { Button } from '../../src/components/ui';
import type { SeverityLevel } from '../../src/types';

const SEVERITY_OPTIONS: { value: SeverityLevel; label: string }[] = [
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' },
];

const severitySelectedStyles: Record<SeverityLevel, { bg: string; text: string; border: string }> = {
  mild: { bg: '#FEF3C7', text: '#92400E', border: '#F59E0B' },
  moderate: { bg: '#FFEDD5', text: '#9A3412', border: '#FB923C' },
  severe: { bg: '#FEE2E2', text: '#991B1B', border: '#EF4444' },
};

export default function SeverityScreen() {
  const router = useRouter();
  const draftProfile = useProfileStore((s) => s.draftProfile);
  const setDraftSeverity = useProfileStore((s) => s.setDraftSeverity);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.stepBadge}>
          Step 3 of 5
        </Text>

        <Text style={styles.title}>
          How severe are your allergies?
        </Text>
        <Text style={styles.subtitle}>
          This helps us calibrate our warnings.
        </Text>

        <View style={styles.allergenList}>
          {draftProfile.allergies.map((allergen) => (
            <View key={allergen} style={styles.allergenCard}>
              <Text style={styles.allergenName}>
                {ALLERGEN_LABELS[allergen] || allergen}
              </Text>
              <View style={styles.optionsRow}>
                {SEVERITY_OPTIONS.map((option) => {
                  const isSelected = draftProfile.severityLevels[allergen] === option.value;
                  const selectedColors = severitySelectedStyles[option.value];
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.severityOption,
                        isSelected
                          ? { backgroundColor: selectedColors.bg, borderColor: selectedColors.border }
                          : styles.severityOptionUnselected,
                      ]}
                      onPress={() => setDraftSeverity(allergen, option.value)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.severityOptionText,
                          isSelected
                            ? { color: selectedColors.text }
                            : styles.severityOptionTextUnselected,
                        ]}
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

        <View style={styles.buttonGroup}>
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
  severityOption: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  severityOptionUnselected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
  },
  severityOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  severityOptionTextUnselected: {
    color: '#6B7280',
  },
  buttonGroup: {
    gap: 12,
  },
});
