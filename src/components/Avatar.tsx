import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface AvatarProps {
  size?: number;
  onPress?: () => void;
  letter?: string;
}

export default function Avatar({ size = 40, onPress, letter = 'A' }: AvatarProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.avatar, {
        width: size, height: size, borderRadius: size / 2,
        borderWidth: size * 0.04,
      }]}
      activeOpacity={0.8}
    >
      <Text style={[styles.letter, { fontSize: size * 0.4 }]}>{letter}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: '#C24B7E',
    // gradient approximated with solid
  },
  letter: {
    color: '#fff',
    fontWeight: '800',
  },
});
