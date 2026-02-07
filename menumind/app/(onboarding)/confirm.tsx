import { View, Text, ScrollView, StyleSheet } from 'react-native';
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.stepBadge}>
          Step 5 of 5
        </Text>

        <Text style={styles.title}>
          Your Dietary Profile
        </Text>
        <Text style={styles.subtitle}>
          Review your profile before saving.
        </Text>

        <View style={styles.cardList}>
          <Card>
            <Text style={styles.cardLabel}>Allergies</Text>
            {draftProfile.allergies.length > 0 ? (
              <View style={styles.chipRow}>
                {draftProfile.allergies.map((a) => (
                  <View key={a} style={styles.allergyChip}>
                    <Text style={styles.allergyChipText}>
                      {ALLERGEN_LABELS[a] || a}
                      {draftProfile.severityLevels[a]
                        ? ` (${draftProfile.severityLevels[a]})`
                        : ''}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>No allergies selected</Text>
            )}
          </Card>

          <Card>
            <Text style={styles.cardLabel}>Diet Types</Text>
            {draftProfile.dietTypes.length > 0 ? (
              <View style={styles.chipRow}>
                {draftProfile.dietTypes.map((d) => {
                  const option = DIET_OPTIONS.find((o) => o.value === d);
                  return (
                    <View key={d} style={styles.dietChip}>
                      <Text style={styles.dietChipText}>
                        {option?.label || d}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ) : (
              <Text style={styles.emptyText}>No specific diet</Text>
            )}
          </Card>

          {draftProfile.customRestrictions.length > 0 && (
            <Card>
              <Text style={styles.cardLabel}>
                Custom Restrictions
              </Text>
              {draftProfile.customRestrictions.map((r, i) => (
                <Text key={i} style={styles.restrictionText}>
                  • {r}
                </Text>
              ))}
            </Card>
          )}
        </View>

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}

        <View style={styles.buttonGroup}>
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
  cardList: {
    gap: 16,
    marginBottom: 32,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  allergyChip: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  allergyChipText: {
    fontSize: 14,
    color: '#991B1B',
    fontWeight: '500',
  },
  dietChip: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  dietChipText: {
    fontSize: 14,
    color: '#065F46',
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 16,
    color: '#4B5563',
  },
  restrictionText: {
    fontSize: 16,
    color: '#374151',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonGroup: {
    gap: 12,
  },
});
