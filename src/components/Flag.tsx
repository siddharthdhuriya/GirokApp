import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/theme';

export default function Flag({ cc }: { cc: string }) {
  return (
    <View style={styles.flag}>
      <Text style={styles.text}>{cc.slice(0, 2)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flag: {
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surface3,
  },
  text: { fontSize: 9, fontWeight: '800', color: Colors.text2, letterSpacing: -0.4 },
});
