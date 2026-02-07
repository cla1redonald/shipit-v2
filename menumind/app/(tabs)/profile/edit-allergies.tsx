import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
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
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Edit Allergies</Text>

        <ChipSelector
          options={COMMON_ALLERGENS}
          selected={draftProfile.allergies}
          onToggle={handleToggle}
        />

        <View style={styles.customRow}>
          <TextInput
            style={styles.customInput}
            placeholder="Add another..."
            value={customAllergen}
            onChangeText={setCustomAllergen}
            onSubmitEditing={addCustom}
          />
          <TouchableOpacity style={styles.addButton} onPress={addCustom}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
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
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    marginBottom: 32,
  },
  customInput: {
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
});
