import { View, Text, TouchableOpacity } from 'react-native';
import { ClassificationBadge, ConfidenceBadge } from './Badge';
import type { ScanItem } from '../../types';

interface DishCardProps {
  item: ScanItem;
  onPress: () => void;
}

const borderColors = {
  safe: 'border-l-safe',
  caution: 'border-l-caution',
  avoid: 'border-l-avoid',
};

export function DishCard({ item, onPress }: DishCardProps) {
  return (
    <TouchableOpacity
      className={`bg-white rounded-xl p-4 border border-gray-100 border-l-4 ${borderColors[item.classification]} shadow-sm`}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1 mr-3">
          <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
            {item.dishName}
          </Text>
          {item.originalName && (
            <Text className="text-sm text-gray-500 mt-0.5" numberOfLines={1}>
              {item.originalName}
            </Text>
          )}
        </View>
        <ClassificationBadge classification={item.classification} size="sm" />
      </View>

      {item.allergensDetected.length > 0 && (
        <Text className="text-sm text-avoid-dark mb-1.5" numberOfLines={1}>
          Contains: {item.allergensDetected.join(', ')}
        </Text>
      )}

      {item.reasoning && (
        <Text className="text-sm text-gray-600 mb-2" numberOfLines={2}>
          {item.reasoning}
        </Text>
      )}

      <View className="flex-row items-center justify-between">
        <ConfidenceBadge confidence={item.confidence} />
        <Text className="text-xs text-brand font-medium">View details →</Text>
      </View>
    </TouchableOpacity>
  );
}
