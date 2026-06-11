import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { Colors } from '@/theme';
import { useApp } from '@/context/AppContext';

function GirokMark({ size = 64, color = Colors.accent }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Path
        d="M5 22 C 11 6, 21 6, 27 16"
        stroke={color} strokeWidth="2.2" strokeLinecap="round"
        strokeDasharray="0.1 4.4"
      />
      <Circle cx="5" cy="22" r="3" fill="#fff" stroke={color} strokeWidth="2" />
      <Circle cx="27" cy="16" r="3.4" fill={color} />
    </Svg>
  );
}

export default function SplashScreen() {
  const { user, loading } = useApp();
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  // Route once auth state is resolved (loading = false)
  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(() => {
      router.replace(user ? '/(tabs)' : '/welcome');
    }, 1800);
    return () => clearTimeout(timer);
  }, [loading, user]);

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={1}
      onPress={() => { if (!loading) router.replace(user ? '/(tabs)' : '/welcome'); }}
    >
      <Animated.View style={[styles.content, { opacity }]}>
        <GirokMark size={64} />
        <Text style={styles.title}>Girok</Text>
        <Text style={styles.tagline}>your journey, illustrated</Text>
      </Animated.View>
      <Text style={styles.loading}>loading your atlas…</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: Colors.mapBg,
    alignItems: 'center', justifyContent: 'center',
  },
  content: { alignItems: 'center', gap: 12 },
  title: { fontSize: 46, fontWeight: '700', letterSpacing: -1.8, color: Colors.text },
  tagline: { fontSize: 19, fontStyle: 'italic', color: Colors.text2 },
  loading: {
    position: 'absolute', bottom: 60,
    fontSize: 12.5, color: Colors.text3, letterSpacing: 0.6,
  },
});
