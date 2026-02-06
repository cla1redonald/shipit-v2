import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
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
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <ScrollView className="flex-1" contentContainerClassName="px-4 pt-6 pb-8 gap-4">
        <Text className="text-2xl font-bold text-gray-900 px-2">Profile</Text>

        {/* User info */}
        <Card>
          <Text className="text-sm text-gray-500">Email</Text>
          <Text className="text-base font-medium text-gray-900">{user?.email}</Text>
          <Text className="text-xs text-gray-400 mt-1">
            Total scans: {history.length}
          </Text>
        </Card>

        {/* Dietary Profile */}
        <Card>
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-semibold text-gray-900">Dietary Profile</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/profile/edit-allergies')}>
              <Text className="text-sm text-brand font-medium">Edit</Text>
            </TouchableOpacity>
          </View>

          <Text className="text-sm font-medium text-gray-500 mb-1.5">Allergies</Text>
          {profile?.allergies && profile.allergies.length > 0 ? (
            <View className="flex-row flex-wrap gap-1.5 mb-3">
              {profile.allergies.map((a) => (
                <View key={a} className="bg-avoid-light px-2.5 py-0.5 rounded-full">
                  <Text className="text-xs text-avoid-dark font-medium">
                    {ALLERGEN_LABELS[a] || a}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-sm text-gray-400 mb-3">None</Text>
          )}

          <Text className="text-sm font-medium text-gray-500 mb-1.5">Diet Types</Text>
          {profile?.dietTypes && profile.dietTypes.length > 0 ? (
            <View className="flex-row flex-wrap gap-1.5 mb-3">
              {profile.dietTypes.map((d) => {
                const opt = DIET_OPTIONS.find((o) => o.value === d);
                return (
                  <View key={d} className="bg-brand-light px-2.5 py-0.5 rounded-full">
                    <Text className="text-xs text-brand-dark font-medium">
                      {opt?.label || d}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <Text className="text-sm text-gray-400 mb-3">None</Text>
          )}

          {profile?.customRestrictions && profile.customRestrictions.length > 0 && (
            <>
              <Text className="text-sm font-medium text-gray-500 mb-1">Custom</Text>
              {profile.customRestrictions.map((r, i) => (
                <Text key={i} className="text-sm text-gray-600">• {r}</Text>
              ))}
            </>
          )}
        </Card>

        {/* Settings */}
        <Card>
          <Text className="text-base font-semibold text-gray-900 mb-3">Settings</Text>
          {[
            { label: 'About MenuMind', route: '/(tabs)/profile/about' },
            { label: 'Privacy Policy', route: '/(tabs)/profile/privacy-policy' },
            { label: 'Terms of Service', route: '/(tabs)/profile/terms' },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              className="py-3 border-b border-gray-50 flex-row items-center justify-between"
              onPress={() => router.push(item.route as any)}
            >
              <Text className="text-base text-gray-700">{item.label}</Text>
              <Text className="text-gray-400">→</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            className="py-3 flex-row items-center justify-between"
            onPress={() => router.push('/(tabs)/profile/delete-account')}
          >
            <Text className="text-base text-avoid">Delete Account</Text>
            <Text className="text-avoid">→</Text>
          </TouchableOpacity>
        </Card>

        <Button title="Sign Out" variant="secondary" onPress={handleSignOut} />

        <Text className="text-xs text-gray-400 text-center mt-2">
          MenuMind v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
