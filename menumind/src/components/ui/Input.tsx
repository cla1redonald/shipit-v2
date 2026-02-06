import { View, TextInput, Text, TextInputProps } from 'react-native';
import { useState } from 'react';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, ...props }: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View className="w-full">
      {label && (
        <Text className="text-sm font-medium text-gray-700 mb-1.5">{label}</Text>
      )}
      <TextInput
        className={`w-full px-4 py-3.5 rounded-xl border text-base ${
          error ? 'border-avoid bg-avoid-light' :
          focused ? 'border-brand bg-white' : 'border-gray-200 bg-gray-50'
        }`}
        placeholderTextColor="#9CA3AF"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
      {error && <Text className="text-xs text-avoid mt-1">{error}</Text>}
    </View>
  );
}
