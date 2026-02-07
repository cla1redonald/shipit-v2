import { View, Text } from 'react-native';

export default function Index() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0F7F4' }}>
      <Text style={{ fontSize: 48 }}>🍽️</Text>
      <Text style={{ fontSize: 32, fontWeight: 'bold', marginTop: 16, color: '#111827' }}>MenuMind</Text>
      <Text style={{ fontSize: 16, color: '#6B7280', marginTop: 8 }}>Snap a menu. Know what's safe.</Text>
    </View>
  );
}
