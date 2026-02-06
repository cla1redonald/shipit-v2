import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useAuthStore } from '../../src/stores/authStore';
import { Button, Input } from '../../src/components/ui';

export default function SignInScreen() {
  const router = useRouter();
  const signIn = useAuthStore((s) => s.signIn);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-6 pt-12 pb-8 flex-grow justify-between"
          keyboardShouldPersistTaps="handled"
        >
          <View>
            <Text className="text-3xl font-bold text-gray-900 mb-2">Welcome back</Text>
            <Text className="text-base text-gray-500 mb-8">Sign in to your account</Text>

            <View className="gap-4">
              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Your password"
                secureTextEntry
                autoComplete="password"
              />
            </View>

            {error ? (
              <Text className="text-avoid text-sm mt-3">{error}</Text>
            ) : null}

            <Button
              title="Forgot Password?"
              variant="text"
              onPress={() => router.push('/(auth)/forgot-password')}
              fullWidth={false}
            />
          </View>

          <View className="gap-3 mt-8">
            <Button title="Sign In" onPress={handleSignIn} loading={loading} />
            <Button
              title="Back"
              variant="secondary"
              onPress={() => router.back()}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
