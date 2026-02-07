import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useProfileStore } from '../../src/stores/profileStore';
import { Button } from '../../src/components/ui';

export default function DisclaimerScreen() {
  const router = useRouter();
  const acceptDisclaimer = useProfileStore((s) => s.acceptDisclaimer);
  const [accepted, setAccepted] = useState(false);

  function handleAccept() {
    acceptDisclaimer();
    router.push('/(onboarding)/allergies');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>⚠️</Text>
        </View>

        <Text style={styles.title}>
          Important Health Information
        </Text>

        <View style={styles.infoBox}>
          <Text style={styles.bodyText}>
            MenuMind uses AI to analyze restaurant menus. It is an informational aid,{' '}
            <Text style={styles.boldText}>NOT a medical device</Text>.
          </Text>
          <Text style={styles.bodyTextSpaced}>
            AI analysis may contain errors. Hidden ingredients, cross-contamination, and kitchen practices cannot be detected from a menu photo alone.
          </Text>
          <Text style={[styles.bodyTextSpaced, styles.semiboldText]}>
            Always confirm ingredients with your server, especially for severe allergies.
          </Text>
          <Text style={styles.bodyTextSpaced}>
            MenuMind cannot guarantee the accuracy of its analysis and is not liable for allergic reactions or adverse health events.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setAccepted(!accepted)}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.checkbox,
              accepted ? styles.checkboxChecked : styles.checkboxUnchecked,
            ]}
          >
            {accepted && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>
            I understand that MenuMind is an aid and not a substitute for confirming
            ingredients with restaurant staff.
          </Text>
        </TouchableOpacity>

        <Button
          title="Continue"
          onPress={handleAccept}
          disabled={!accepted}
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
  iconContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  iconText: {
    fontSize: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  infoBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  bodyText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  bodyTextSpaced: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginTop: 12,
  },
  boldText: {
    fontWeight: 'bold',
  },
  semiboldText: {
    fontWeight: '600',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 32,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkboxUnchecked: {
    borderColor: '#D1D5DB',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});
