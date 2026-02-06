import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useAuthStore } from '../../src/stores/authStore';
import { Button, Input } from '../../src/components/ui';

export default function SignUpScreen() {
  const router = useRouter();
  const signUp = useAuthStore((s) => s.signUp);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signUp(email, password);
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
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
            <Text className="text-3xl font-bold text-gray-900 mb-2">Create account</Text>
            <Text className="text-base text-gray-500 mb-8">
              Set up your MenuMind account
            </Text>

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
                placeholder="At least 8 characters"
                secureTextEntry
                autoComplete="new-password"
              />
              <Input
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm your password"
                secureTextEntry
                autoComplete="new-password"
              />
            </View>

            {error ? (
              <Text className="text-avoid text-sm mt-3">{error}</Text>
            ) : null}
          </View>

          <View className="gap-3 mt-8">
            <Button title="Create Account" onPress={handleSignUp} loading={loading} />
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
