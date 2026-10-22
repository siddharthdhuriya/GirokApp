import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '@/components/Icon';
import Avatar from '@/components/Avatar';
import { Colors, Radii } from '@/theme';
import { useApp } from '@/context/AppContext';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { user, displayName, updateName, resetPassword, signOut } = useApp();
  const [name, setName] = useState(displayName);
  const [savingName, setSavingName] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  async function saveName() {
    const trimmed = name.trim();
    if (!trimmed || trimmed === displayName) return;
    setSavingName(true);
    const err = await updateName(trimmed);
    setSavingName(false);
    if (err) Alert.alert('Could not update name', err);
    else Alert.alert('Name updated', `You're now travelling as ${trimmed}.`);
  }

  async function sendReset() {
    if (!user?.email) return;
    setSendingReset(true);
    const err = await resetPassword(user.email);
    setSendingReset(false);
    if (err) Alert.alert('Could not send email', err);
    else Alert.alert('Check your inbox', `A password reset link was sent to ${user.email}.`);
  }

  function confirmSignOut() {
    Alert.alert('Log out?', 'Your trips stay safe in your account.', [
      { text: 'Stay', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => signOut() },
    ]);
  }

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={[styles.topbar, { paddingTop: insets.top + 6 }]}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <Icon name="arrowLeft" size={20} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.heading}>Settings</Text>
        <View style={{ width: 42 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 32 }} showsVerticalScrollIndicator={false}>
        {/* Account */}
        <View style={[styles.row, { gap: 14, marginBottom: 20 }]}>
          <Avatar size={56} letter={displayName[0]?.toUpperCase()} />
          <View style={{ flex: 1 }}>
            <Text style={styles.accountName}>{displayName}</Text>
            <Text style={styles.accountEmail}>{user?.email}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Profile</Text>
        <View style={styles.card}>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Display name</Text>
            <View style={[styles.row, { gap: 10 }]}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor={Colors.text3}
                autoCapitalize="words"
              />
              <TouchableOpacity
                style={[styles.saveBtn, { opacity: name.trim() && name.trim() !== displayName ? 1 : 0.4 }]}
                onPress={saveName}
                disabled={savingName}
                activeOpacity={0.85}
              >
                {savingName ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.saveBtnText}>Save</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Security</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.actionRow} onPress={sendReset} disabled={sendingReset} activeOpacity={0.7}>
            <View style={styles.actionIcon}><Icon name="lock" size={18} color={Colors.train} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.actionLabel}>Change password</Text>
              <Text style={styles.actionSub}>We'll email you a reset link</Text>
            </View>
            {sendingReset ? <ActivityIndicator size="small" color={Colors.text3} /> : <Icon name="chevR" size={18} color={Colors.text3} />}
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>About</Text>
        <View style={styles.card}>
          <View style={[styles.actionRow, { borderBottomWidth: 1, borderBottomColor: Colors.hairline }]}>
            <View style={styles.actionIcon}><Icon name="compass" size={18} color={Colors.accent} /></View>
            <Text style={[styles.actionLabel, { flex: 1 }]}>Version</Text>
            <Text style={styles.actionSub}>1.0.0</Text>
          </View>
          <View style={styles.actionRow}>
            <View style={styles.actionIcon}><Icon name="globe" size={18} color={Colors.road} /></View>
            <Text style={[styles.actionLabel, { flex: 1 }]}>Made for travellers</Text>
            <Text style={styles.actionSub}>girok.app</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={confirmSignOut} activeOpacity={0.8}>
          <Icon name="arrowLeft" size={17} color={Colors.flight} />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  topbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12 },
  heading: { fontSize: 17, fontWeight: '700', color: Colors.text },
  iconBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.surface2, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center' },
  accountName: { fontSize: 19, fontWeight: '700', color: Colors.text, letterSpacing: -0.3 },
  accountEmail: { fontSize: 13.5, color: Colors.text2, marginTop: 2 },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1.8, textTransform: 'uppercase', color: Colors.text3, marginBottom: 10 },
  card: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.hairline, borderRadius: Radii.lg, padding: 14 },
  field: { gap: 8 },
  fieldLabel: { fontSize: 12.5, fontWeight: '600', color: Colors.text2 },
  input: { backgroundColor: Colors.surface2, color: Colors.text, borderWidth: 1.5, borderColor: Colors.hairline, borderRadius: Radii.md, padding: 13, fontSize: 15 },
  saveBtn: { backgroundColor: Colors.accent, borderRadius: Radii.md, paddingHorizontal: 18, paddingVertical: 13, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 14.5 },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 11 },
  actionIcon: { width: 36, height: 36, borderRadius: 11, backgroundColor: Colors.surface2, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontWeight: '600', fontSize: 14.5, color: Colors.text },
  actionSub: { fontSize: 12.5, color: Colors.text2, marginTop: 1 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, marginTop: 28 },
  logoutText: { fontWeight: '600', fontSize: 15, color: Colors.flight },
});
