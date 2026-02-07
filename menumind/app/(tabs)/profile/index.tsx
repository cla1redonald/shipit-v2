import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../../src/stores/authStore';
import { useProfileStore } from '../../../src/stores/profileStore';
import { useScanStore } from '../../../src/stores/scanStore';
import { ALLERGEN_LABELS, DIET_OPTIONS } from '../../../src/constants';
import { Card, Button } from '../../../src/components/ui';

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const profile = useProfileStore((s) => s.profile);
  const clearProfile = useProfileStore((s) => s.clearProfile);
  const history = useScanStore((s) => s.history);

  async function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          clearProfile();
          await signOut();
          router.replace('/');
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>Profile</Text>

        {/* User info */}
        <Card>
          <Text style={styles.emailLabel}>Email</Text>
          <Text style={styles.emailValue}>{user?.email}</Text>
          <Text style={styles.scanCount}>
            Total scans: {history.length}
          </Text>
        </Card>

        {/* Dietary Profile */}
        <Card>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Dietary Profile</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/profile/edit-allergies')}>
              <Text style={styles.editLink}>Edit</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.fieldLabel}>Allergies</Text>
          {profile?.allergies && profile.allergies.length > 0 ? (
            <View style={styles.chipRow}>
              {profile.allergies.map((a) => (
                <View key={a} style={styles.allergyChip}>
                  <Text style={styles.allergyChipText}>
                    {ALLERGEN_LABELS[a] || a}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noneText}>None</Text>
          )}

          <Text style={styles.fieldLabel}>Diet Types</Text>
          {profile?.dietTypes && profile.dietTypes.length > 0 ? (
            <View style={styles.chipRow}>
              {profile.dietTypes.map((d) => {
                const opt = DIET_OPTIONS.find((o) => o.value === d);
                return (
                  <View key={d} style={styles.dietChip}>
                    <Text style={styles.dietChipText}>
                      {opt?.label || d}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <Text style={styles.noneText}>None</Text>
          )}

          {profile?.customRestrictions && profile.customRestrictions.length > 0 && (
            <>
              <Text style={styles.customLabel}>Custom</Text>
              {profile.customRestrictions.map((r, i) => (
                <Text key={i} style={styles.customItem}>• {r}</Text>
              ))}
            </>
          )}
        </Card>

        {/* Settings */}
        <Card>
          <Text style={styles.settingsTitle}>Settings</Text>
          {[
            { label: 'About MenuMind', route: '/(tabs)/profile/about' },
            { label: 'Privacy Policy', route: '/(tabs)/profile/privacy-policy' },
            { label: 'Terms of Service', route: '/(tabs)/profile/terms' },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.settingsItem}
              onPress={() => router.push(item.route as any)}
            >
              <Text style={styles.settingsItemText}>{item.label}</Text>
              <Text style={styles.settingsArrow}>→</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.deleteItem}
            onPress={() => router.push('/(tabs)/profile/delete-account')}
          >
            <Text style={styles.deleteItemText}>Delete Account</Text>
            <Text style={styles.deleteArrow}>→</Text>
          </TouchableOpacity>
        </Card>

        <Button title="Sign Out" variant="secondary" onPress={handleSignOut} />

        <Text style={styles.versionText}>
          MenuMind v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
    gap: 16,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    paddingHorizontal: 8,
  },
  emailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  emailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  scanCount: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  editLink: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 6,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  allergyChip: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  allergyChipText: {
    fontSize: 12,
    color: '#991B1B',
    fontWeight: '500',
  },
  dietChip: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  dietChipText: {
    fontSize: 12,
    color: '#065F46',
    fontWeight: '500',
  },
  noneText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  customLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
  },
  customItem: {
    fontSize: 14,
    color: '#4B5563',
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  settingsItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingsItemText: {
    fontSize: 16,
    color: '#374151',
  },
  settingsArrow: {
    color: '#9CA3AF',
  },
  deleteItem: {
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deleteItemText: {
    fontSize: 16,
    color: '#EF4444',
  },
  deleteArrow: {
    color: '#EF4444',
  },
  versionText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
  },
});
