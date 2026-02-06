import { View, Text, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../../src/components/ui';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <LinearGradient colors={['#F0F7F4', '#D1FAE5', '#ECFDF5']} className="flex-1">
      <SafeAreaView className="flex-1 px-6 justify-between pb-8">
        <View className="flex-1 items-center justify-center">
          <View className="w-24 h-24 bg-brand rounded-3xl items-center justify-center mb-6">
            <Text className="text-5xl">🍽️</Text>
          </View>
          <Text className="text-4xl font-bold text-gray-900 text-center mb-3">
            MenuMind
          </Text>
          <Text className="text-lg text-gray-600 text-center px-4">
            Snap a menu. Know what's safe.
          </Text>
          <Text className="text-base text-gray-500 text-center px-8 mt-4">
            AI-powered menu analysis for your dietary needs. Works on any menu, any language.
          </Text>
        </View>

        <View className="gap-3">
          <Button
            title="Get Started"
            onPress={() => router.push('/(auth)/sign-up')}
          />
          <Button
            title="I Already Have an Account"
            variant="outline"
            onPress={() => router.push('/(auth)/sign-in')}
          />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
