import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="edit-allergies" />
      <Stack.Screen name="edit-diet" />
      <Stack.Screen name="edit-severity" />
      <Stack.Screen name="about" />
      <Stack.Screen name="privacy-policy" />
      <Stack.Screen name="terms" />
      <Stack.Screen name="delete-account" />
    </Stack>
  );
}
