import { View, Text } from 'react-native';

export function DisclaimerFooter() {
  return (
    <View className="px-4 py-3 bg-gray-50 border-t border-gray-100">
      <Text className="text-xs text-gray-500 text-center">
        AI analysis may contain errors. Always confirm with your server.
      </Text>
    </View>
  );
}
