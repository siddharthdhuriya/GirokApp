import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Animated, ActivityIndicator, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Radii } from '@/theme';
import { useApp } from '@/context/AppContext';

function GirokMark({ size = 26, color = Colors.accent }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Path d="M5 22 C 11 6, 21 6, 27 16" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeDasharray="0.1 4.4" />
      <Circle cx="5" cy="22" r="3" fill="#fff" stroke={color} strokeWidth="2" />
      <Circle cx="27" cy="16" r="3.4" fill={color} />
    </Svg>
  );
}

type AuthMode = null | 'signup' | 'login';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { signIn, signUp, resetPassword } = useApp();
  const [mode, setMode] = useState<AuthMode>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const slideAnim = useRef(new Animated.Value(300)).current;

  function openSheet(m: AuthMode) {
    setMode(m);
    setError(null);
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 }).start();
  }
  function closeSheet() {
    Animated.timing(slideAnim, { toValue: 300, duration: 250, useNativeDriver: true }).start(() => setMode(null));
  }
  async function handleAuth() {
    if (!email.trim() || !password.trim()) { setError('Please enter your email and password.'); return; }
    setBusy(true);
    setError(null);
    const err = mode === 'login'
      ? await signIn(email.trim(), password)
      : await signUp(email.trim(), password, name.trim() || undefined);
    setBusy(false);
    if (err) { setError(err); return; }
    router.replace('/(tabs)');
  }
  async function handleForgot() {
    if (!email.trim()) { setError('Enter your email above, then tap "Forgot password?" again.'); return; }
    setBusy(true);
    setError(null);
    const err = await resetPassword(email.trim());
    setBusy(false);
    if (err) setError(err);
    else Alert.alert('Check your inbox', `A password reset link was sent to ${email.trim()}.`);
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(9,11,17,0.35)', 'rgba(9,11,17,0.2)', Colors.bg]}
        locations={[0, 0.38, 0.86]}
        style={StyleSheet.absoluteFill}
      />

      {/* Hero content */}
      <View style={[styles.hero, { paddingBottom: insets.bottom + 36 }]}>
        <View style={styles.wordmark}>
          <GirokMark size={28} />
          <Text style={styles.wordmarkText}>Girok</Text>
        </View>

        <Text style={styles.headline}>Every trip,{'\n'}on one beautiful map.</Text>
        <Text style={styles.sub}>
          Scan a boarding pass and watch your world fill in. Girok turns your travels into a living atlas you'll want to show off.
        </Text>

        <View style={styles.buttons}>
          <TouchableOpacity style={styles.btnPrimary} onPress={() => openSheet('signup')} activeOpacity={0.85}>
            <Text style={styles.btnPrimaryText}>Create your atlas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnSecondary} onPress={() => openSheet('login')} activeOpacity={0.8}>
            <Text style={styles.btnSecondaryText}>I already have an account</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Sheet */}
      {mode && (
        <View style={StyleSheet.absoluteFill}>
          <TouchableOpacity style={styles.scrim} activeOpacity={1} onPress={closeSheet} />
          <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }], paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.sheetGrab} />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
              <Text style={styles.sheetTitle}>{mode === 'login' ? 'Welcome back' : 'Create your account'}</Text>
              <Text style={styles.sheetSub}>{mode === 'login' ? 'Pick up right where you left off.' : 'Start logging journeys in seconds.'}</Text>

              <View style={styles.fieldGroup}>
                {mode === 'signup' && (
                  <View style={styles.field}>
                    <Text style={styles.fieldLabel}>Name</Text>
                    <TextInput style={styles.input} value={name} onChangeText={setName}
                      placeholder="Your name" placeholderTextColor={Colors.text3}
                      autoCapitalize="words" />
                  </View>
                )}
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Email</Text>
                  <TextInput style={styles.input} value={email} onChangeText={setEmail}
                    placeholder="you@email.com" placeholderTextColor={Colors.text3}
                    keyboardType="email-address" autoCapitalize="none" />
                </View>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Password</Text>
                  <TextInput style={styles.input} value={password} onChangeText={setPassword}
                    placeholder="••••••••" placeholderTextColor={Colors.text3}
                    secureTextEntry />
                </View>
                {mode === 'login' && (
                  <TouchableOpacity onPress={handleForgot} disabled={busy}>
                    <Text style={styles.forgot}>Forgot password?</Text>
                  </TouchableOpacity>
                )}
                {error && <Text style={styles.errorText}>{error}</Text>}
                <TouchableOpacity style={styles.btnPrimary} onPress={handleAuth} activeOpacity={0.85} disabled={busy}>
                  {busy
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.btnPrimaryText}>{mode === 'login' ? 'Log in' : 'Create account'}</Text>
                  }
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.mapBg },
  hero: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24 },
  wordmark: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 18 },
  wordmarkText: { fontSize: 26, fontWeight: '700', letterSpacing: -0.8, color: Colors.text },
  headline: { fontSize: 40, fontWeight: '700', letterSpacing: -1.2, color: Colors.text, lineHeight: 42, maxWidth: 300 },
  sub: { fontSize: 15.5, color: Colors.text2, marginTop: 14, maxWidth: 310, lineHeight: 23 },
  buttons: { gap: 11, marginTop: 26 },
  btnPrimary: { backgroundColor: Colors.accent, borderRadius: Radii.pill, padding: 17, alignItems: 'center',
    shadowColor: Colors.accent, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 6 },
  btnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 16.5 },
  btnSecondary: { borderRadius: Radii.pill, padding: 17, alignItems: 'center' },
  btnSecondaryText: { color: Colors.text, fontWeight: '600', fontSize: 15 },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radii.xl, borderTopRightRadius: Radii.xl,
    borderTopWidth: 1, borderTopColor: Colors.hairline2,
    padding: 20, paddingTop: 10,
  },
  sheetGrab: { width: 38, height: 5, borderRadius: 99, backgroundColor: Colors.hairline2, alignSelf: 'center', marginBottom: 18 },
  sheetTitle: { fontSize: 25, fontWeight: '700', letterSpacing: -0.5, color: Colors.text, marginBottom: 4 },
  sheetSub: { fontSize: 14, color: Colors.text2, marginBottom: 20 },
  fieldGroup: { gap: 14 },
  field: { gap: 7 },
  fieldLabel: { fontSize: 12.5, fontWeight: '600', color: Colors.text2 },
  input: {
    backgroundColor: Colors.surface2, color: Colors.text,
    borderWidth: 1.5, borderColor: Colors.hairline, borderRadius: Radii.md,
    padding: 14, fontSize: 15,
  },
  forgot: { color: Colors.accent, fontWeight: '600', fontSize: 13 },
  errorText: { fontSize: 13.5, color: Colors.flight, textAlign: 'center' },
});
