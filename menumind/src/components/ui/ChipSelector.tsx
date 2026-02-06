import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

interface ChipSelectorProps<T extends string> {
  options: { value: T; label: string }[];
  selected: T[];
  onToggle: (value: T) => void;
  multiSelect?: boolean;
}

export function ChipSelector<T extends string>({
  options,
  selected,
  onToggle,
  multiSelect = true,
}: ChipSelectorProps<T>) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = selected.includes(option.value);
        return (
          <TouchableOpacity
            key={option.value}
            className={`px-4 py-2.5 rounded-full border ${
              isSelected
                ? 'bg-brand border-brand'
                : 'bg-white border-gray-200'
            }`}
            onPress={() => onToggle(option.value)}
            activeOpacity={0.7}
          >
            <Text
              className={`text-sm font-medium ${
                isSelected ? 'text-white' : 'text-gray-700'
              }`}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
