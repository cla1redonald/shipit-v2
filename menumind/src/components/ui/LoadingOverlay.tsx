import { View, Text, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';

const messages = [
  'Reading your menu...',
  'Identifying dishes...',
  'Checking ingredients...',
  'Analyzing for your allergies...',
  'Almost ready...',
];

export function LoadingOverlay() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-white p-8">
      <ActivityIndicator size="large" color="#10B981" />
      <Text className="text-lg font-medium text-gray-900 mt-6 text-center">
        {messages[messageIndex]}
      </Text>
      <Text className="text-sm text-gray-500 mt-2 text-center">
        Usually takes 3-5 seconds
      </Text>
    </View>
  );
}
