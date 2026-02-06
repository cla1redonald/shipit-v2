import { View, Text, Alert } from 'react-native';
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
    <SafeAreaView className="flex-1 bg-white px-6 pt-12">
      <View className="items-center mb-8">
        <View className="w-16 h-16 bg-avoid-light rounded-full items-center justify-center mb-4">
          <Text className="text-3xl">⚠️</Text>
        </View>
        <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
          Delete Account
        </Text>
        <Text className="text-base text-gray-500 text-center">
          This action is permanent and cannot be undone. All your data will be removed.
        </Text>
      </View>

      <View className="bg-avoid-light rounded-2xl p-4 mb-8">
        <Text className="text-sm text-avoid-dark font-medium mb-2">This will delete:</Text>
        <Text className="text-sm text-avoid-dark">• Your dietary profile</Text>
        <Text className="text-sm text-avoid-dark">• All scan history</Text>
        <Text className="text-sm text-avoid-dark">• All menu photos</Text>
        <Text className="text-sm text-avoid-dark">• Your account credentials</Text>
      </View>

      <View className="gap-3">
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
