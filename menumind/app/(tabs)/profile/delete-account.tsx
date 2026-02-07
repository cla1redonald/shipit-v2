import { View, Text, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useAuthStore } from '../../../src/stores/authStore';
import { useProfileStore } from '../../../src/stores/profileStore';
import { deleteAllUserData } from '../../../src/services/scans';
import { Button } from '../../../src/components/ui';

export default function DeleteAccountScreen() {
  const router = useRouter();
  const clearProfile = useProfileStore((s) => s.clearProfile);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all data including your profile, scan history, and menu photos. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await deleteAllUserData();
              clearProfile();
              router.replace('/');
            } catch (err) {
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.iconSection}>
        <View style={styles.warningCircle}>
          <Text style={styles.warningEmoji}>⚠️</Text>
        </View>
        <Text style={styles.title}>
          Delete Account
        </Text>
        <Text style={styles.subtitle}>
          This action is permanent and cannot be undone. All your data will be removed.
        </Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>This will delete:</Text>
        <Text style={styles.infoItem}>• Your dietary profile</Text>
        <Text style={styles.infoItem}>• All scan history</Text>
        <Text style={styles.infoItem}>• All menu photos</Text>
        <Text style={styles.infoItem}>• Your account credentials</Text>
      </View>

      <View style={styles.actions}>
        <Button
          title="Delete My Account"
          variant="danger"
          onPress={handleDelete}
          loading={loading}
        />
        <Button title="Cancel" variant="secondary" onPress={() => router.back()} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  iconSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  warningCircle: {
    width: 64,
    height: 64,
    backgroundColor: '#FEE2E2',
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  warningEmoji: {
    fontSize: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: '#FEE2E2',
    borderRadius: 16,
    padding: 16,
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 14,
    color: '#991B1B',
    fontWeight: '500',
    marginBottom: 8,
  },
  infoItem: {
    fontSize: 14,
    color: '#991B1B',
  },
  actions: {
    gap: 12,
  },
});
