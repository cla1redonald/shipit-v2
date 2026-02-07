import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

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
    <View style={styles.container}>
      {options.map((option) => {
        const isSelected = selected.includes(option.value);
        return (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.chip,
              isSelected ? styles.chipSelected : styles.chipDefault,
            ]}
            onPress={() => onToggle(option.value)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.chipText,
                isSelected ? styles.chipTextSelected : styles.chipTextDefault,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 9999,
    borderWidth: 1,
  },
  chipSelected: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  chipDefault: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  chipTextDefault: {
    color: '#374151',
  },
});
