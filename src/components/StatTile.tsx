import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from './Icon';
import { Colors, Radii } from '@/theme';

interface StatTileProps {
  num: string | number;
  label: string;
  icon: string;
  accent?: string;
}

export default function StatTile({ num, label, icon, accent = Colors.text }: StatTileProps) {
  return (
    <View style={styles.tile}>
      <View style={styles.iconWrap}>
        <Icon name={icon} size={18} color={accent} />
      </View>
      <Text style={styles.num}>{num}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.hairline,
    borderRadius: Radii.lg,
    padding: 16,
    gap: 3,
    overflow: 'hidden',
  },
  iconWrap: { position: 'absolute', top: 13, right: 13, opacity: 0.5 },
  num: { fontWeight: '700', fontSize: 30, letterSpacing: -0.4, color: Colors.text, lineHeight: 34 },
  label: { fontSize: 12.5, color: Colors.text2, fontWeight: '500' },
});
