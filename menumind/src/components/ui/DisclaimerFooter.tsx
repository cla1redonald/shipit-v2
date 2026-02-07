import { View, Text, StyleSheet } from 'react-native';

export function DisclaimerFooter() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        AI analysis may contain errors. Always confirm with your server.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  text: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
});
