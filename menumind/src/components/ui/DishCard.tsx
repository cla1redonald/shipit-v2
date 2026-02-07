import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { ClassificationBadge, ConfidenceBadge } from './Badge';
import type { ScanItem, DishClassification } from '../../types';

interface DishCardProps {
  item: ScanItem;
  onPress: () => void;
}

const borderLeftColors: Record<DishClassification, ViewStyle> = {
  safe: { borderLeftColor: '#22C55E' },
  caution: { borderLeftColor: '#F59E0B' },
  avoid: { borderLeftColor: '#EF4444' },
};

export function DishCard({ item, onPress }: DishCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, borderLeftColors[item.classification]]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.dishName} numberOfLines={1}>
            {item.dishName}
          </Text>
          {item.originalName && (
            <Text style={styles.originalName} numberOfLines={1}>
              {item.originalName}
            </Text>
          )}
        </View>
        <ClassificationBadge classification={item.classification} size="sm" />
      </View>

      {item.allergensDetected.length > 0 && (
        <Text style={styles.allergens} numberOfLines={1}>
          Contains: {item.allergensDetected.join(', ')}
        </Text>
      )}

      {item.reasoning && (
        <Text style={styles.reasoning} numberOfLines={2}>
          {item.reasoning}
        </Text>
      )}

      <View style={styles.footer}>
        <ConfidenceBadge confidence={item.confidence} />
        <Text style={styles.viewDetails}>View details →</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderLeftWidth: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  dishName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  originalName: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  allergens: {
    fontSize: 14,
    color: '#991B1B',
    marginBottom: 6,
  },
  reasoning: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewDetails: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
});
