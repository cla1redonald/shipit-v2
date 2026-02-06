import { View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useAuthStore } from '../../src/stores/authStore';
import { Button, Input } from '../../src/components/ui';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const resetPassword = useAuthStore((s) => s.resetPassword);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    if (!email) {
      setError('Please enter your email');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 px-6 pt-12"
      >
        <Text className="text-3xl font-bold text-gray-900 mb-2">Reset password</Text>
        <Text className="text-base text-gray-500 mb-8">
          Enter your email and we'll send you a reset link.
        </Text>

        {sent ? (
          <View className="bg-brand-light rounded-2xl p-6">
            <Text className="text-brand-dark text-base font-medium text-center">
              Check your email for a reset link.
            </Text>
          </View>
        ) : (
          <View className="gap-4">
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {error ? <Text className="text-avoid text-sm">{error}</Text> : null}
            <Button title="Send Reset Link" onPress={handleReset} loading={loading} />
          </View>
        )}

        <Button
          title="Back to Sign In"
          variant="text"
          onPress={() => router.back()}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
