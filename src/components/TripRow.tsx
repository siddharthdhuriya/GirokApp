import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from './Icon';
import { Colors, Radii } from '@/theme';
import { CITIES, Trip, TypeMeta } from '@/data';
import { fmt } from '@/utils/fmt';

interface TripRowProps {
  trip: Trip;
  onPress: () => void;
  last?: boolean;
}

export default function TripRow({ trip: t, onPress, last }: TripRowProps) {
  const m = TypeMeta[t.type];
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.row, !last && styles.border]}
    >
      <View style={[styles.icon, { backgroundColor: m.soft }]}>
        <Icon name={t.type === 'flight' ? 'plane' : t.type === 'train' ? 'train' : 'car'}
              size={22} color={m.color} fill={t.type === 'flight'} />
      </View>
      <View style={styles.info}>
        <View style={styles.route}>
          <Text style={styles.city}>{CITIES[t.from].city}</Text>
          <Icon name="arrowRight" size={15} color={Colors.text3} />
          <Text style={styles.city}>{CITIES[t.to].city}</Text>
        </View>
        <Text style={styles.meta}>{fmt.date(t.date)} · {fmt.kmFull(t.dist)} km</Text>
      </View>
      <Icon name="chevR" size={18} color={Colors.text3} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  border: { borderBottomWidth: 1, borderBottomColor: Colors.hairline },
  icon: { width: 44, height: 44, borderRadius: Radii.sm, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  route: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  city: { fontWeight: '700', fontSize: 16, color: Colors.text, letterSpacing: -0.2 },
  meta: { fontSize: 12.5, color: Colors.text2, marginTop: 2 },
});
