import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from './Icon';
import { Colors, Radii } from '@/theme';

const TIER_C: Record<string, string> = {
  bronze: '#C88A5B',
  silver: '#C2CBDA',
  gold: '#F3C46B',
};

interface BadgeProps {
  achievement: {
    name: string;
    icon: string;
    tier: string;
    unlocked: boolean;
  };
}

export default function Badge({ achievement: a }: BadgeProps) {
  const tc = TIER_C[a.tier];
  return (
    <View style={[styles.badge, a.unlocked ? {} : styles.locked]}>
      <View style={[styles.medal, { backgroundColor: a.unlocked ? tc : Colors.surface2 }]}>
        <Icon
          name={a.unlocked ? a.icon : 'lock'}
          size={a.unlocked ? 26 : 20}
          color={a.unlocked ? '#1a1206' : Colors.text3}
          fill={['globe', 'heart'].includes(a.icon) && a.unlocked}
        />
      </View>
      <Text style={styles.name} numberOfLines={2}>{a.name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    aspectRatio: 1,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.hairline,
    padding: 12,
  },
  locked: { opacity: 0.42 },
  medal: {
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
  },
  name: { fontSize: 11.5, fontWeight: '700', color: Colors.text, textAlign: 'center', lineHeight: 15 },
});
