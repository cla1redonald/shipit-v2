import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';
import { useProfileStore } from '../src/stores/profileStore';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const fetchProfile = useProfileStore((s) => s.fetchProfile);
  const onboardingCompleted = useProfileStore((s) => s.onboardingCompleted);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile().finally(() => setReady(true));
    } else {
      setReady(true);
    }
  }, [isAuthenticated]);

  if (!ready) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (!onboardingCompleted) {
    return <Redirect href="/(onboarding)/disclaimer" />;
  }

  return <Redirect href="/(tabs)/scan" />;
}
