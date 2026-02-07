import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
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
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Edit Diet Types</Text>

        <ChipSelector
          options={DIET_OPTIONS.map((d) => ({ value: d.value, label: d.label }))}
          selected={draftProfile.dietTypes}
          onToggle={handleToggle}
        />

        <View style={styles.saveWrapper}>
          <Button title="Save Changes" onPress={handleSave} loading={loading} />
        </View>
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
  saveWrapper: {
    marginTop: 32,
  },
});
