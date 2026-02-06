import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="disclaimer" />
      <Stack.Screen name="allergies" />
      <Stack.Screen name="diet-type" />
      <Stack.Screen name="severity" />
      <Stack.Screen name="custom-restrictions" />
      <Stack.Screen name="confirm" />
    </Stack>
  );
}
