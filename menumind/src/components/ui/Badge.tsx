import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import type { DishClassification, ConfidenceLevel } from '../../types';

interface ClassificationBadgeProps {
  classification: DishClassification;
  size?: 'sm' | 'md' | 'lg';
}

const classificationStyles: Record<DishClassification, { bg: ViewStyle; text: TextStyle }> = {
  safe: {
    bg: { backgroundColor: '#DCFCE7' },
    text: { color: '#166534' },
  },
  caution: {
    bg: { backgroundColor: '#FEF3C7' },
    text: { color: '#92400E' },
  },
  avoid: {
    bg: { backgroundColor: '#FEE2E2' },
    text: { color: '#991B1B' },
  },
};

const classificationLabels: Record<DishClassification, { label: string; icon: string }> = {
  safe: { label: 'Safe', icon: '\u2713' },
  caution: { label: 'Caution', icon: '!' },
  avoid: { label: 'Avoid', icon: '\u2715' },
};

const sizeContainerStyles: Record<string, ViewStyle> = {
  sm: { paddingHorizontal: 8, paddingVertical: 2 },
  md: { paddingHorizontal: 12, paddingVertical: 4 },
  lg: { paddingHorizontal: 16, paddingVertical: 8 },
};

const sizeTextStyles: Record<string, TextStyle> = {
  sm: { fontSize: 12 },
  md: { fontSize: 14 },
  lg: { fontSize: 16 },
};

export function ClassificationBadge({ classification, size = 'md' }: ClassificationBadgeProps) {
  const colorStyle = classificationStyles[classification];
  const labels = classificationLabels[classification];

  return (
    <View style={[styles.badgeContainer, colorStyle.bg, sizeContainerStyles[size]]}>
      <Text style={[colorStyle.text, sizeTextStyles[size], styles.iconText]}>{labels.icon}</Text>
      <Text style={[colorStyle.text, sizeTextStyles[size], styles.labelText]}>{labels.label}</Text>
    </View>
  );
}

interface ConfidenceBadgeProps {
  confidence: ConfidenceLevel;
}

const confidenceStyles: Record<ConfidenceLevel, { bg: ViewStyle; text: TextStyle; label: string }> = {
  high: {
    bg: { backgroundColor: '#F3F4F6' },
    text: { color: '#374151' },
    label: 'High confidence',
  },
  medium: {
    bg: { backgroundColor: '#FEFCE8' },
    text: { color: '#A16207' },
    label: 'Medium confidence',
  },
  low: {
    bg: { backgroundColor: '#FFF7ED' },
    text: { color: '#C2410C' },
    label: 'Low \u2014 ask server',
  },
};

export function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  const config = confidenceStyles[confidence];
  return (
    <View style={[styles.confidenceContainer, config.bg]}>
      <Text style={[styles.confidenceText, config.text]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badgeContainer: {
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconText: {
    fontWeight: 'bold',
  },
  labelText: {
    fontWeight: '600',
  },
  confidenceContainer: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
