import { Stack } from 'expo-router';

export default function ScanLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="camera" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="preview" />
      <Stack.Screen name="analyzing" options={{ gestureEnabled: false }} />
      <Stack.Screen name="results" />
    </Stack>
  );
}
