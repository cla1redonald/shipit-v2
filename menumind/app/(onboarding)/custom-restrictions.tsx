import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useProfileStore } from '../../src/stores/profileStore';
import { Button } from '../../src/components/ui';

export default function CustomRestrictionsScreen() {
  const router = useRouter();
  const draftProfile = useProfileStore((s) => s.draftProfile);
  const setDraftCustomRestrictions = useProfileStore((s) => s.setDraftCustomRestrictions);
  const [text, setText] = useState(draftProfile.customRestrictions.join('\n'));

  function handleNext() {
    const restrictions = text
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean);
    setDraftCustomRestrictions(restrictions);
    router.push('/(onboarding)/confirm');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.stepBadge}>
          Step 4 of 5
        </Text>

        <Text style={styles.title}>
          Anything else we should know?
        </Text>
        <Text style={styles.subtitle}>
          Add any other dietary needs or preferences.
        </Text>

        <TextInput
          style={styles.textInput}
          placeholder="e.g., No cilantro, avoid spicy food, no raw fish..."
          value={text}
          onChangeText={setText}
          multiline
          textAlignVertical="top"
        />

        <View style={styles.buttonGroup}>
          <Button title="Next" onPress={handleNext} />
          <Button
            title="Skip"
            variant="text"
            onPress={() => {
              setDraftCustomRestrictions([]);
              router.push('/(onboarding)/confirm');
            }}
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
  textInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    minHeight: 120,
  },
  buttonGroup: {
    gap: 12,
    marginTop: 32,
  },
});
