import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from './Icon';
import { TypeMeta, TripType } from '@/data';
import { Radii } from '@/theme';

export default function TypeTag({ type }: { type: TripType }) {
  const m = TypeMeta[type];
  return (
    <View style={[styles.tag, { backgroundColor: m.soft }]}>
      <Icon
        name={type === 'flight' ? 'plane' : type === 'train' ? 'train' : 'car'}
        size={13} color={m.color} fill={type === 'flight'}
      />
      <Text style={[styles.label, { color: m.color }]}>{m.label.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 9, paddingVertical: 4,
    borderRadius: Radii.pill,
  },
  label: { fontSize: 11.5, fontWeight: '700', letterSpacing: 0.6 },
});
