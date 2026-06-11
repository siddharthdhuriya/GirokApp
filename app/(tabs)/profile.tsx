import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '@/components/Icon';
import Avatar from '@/components/Avatar';
import Badge from '@/components/Badge';
import { Colors, Radii } from '@/theme';
import { ACHIEVEMENTS, CITIES, PROFILE, Trip, Stats, TypeMeta } from '@/data';
import { fmt } from '@/utils/fmt';
import { useApp } from '@/context/AppContext';

const CONTINENT: Record<string, string> = {
  IN:'Asia',SG:'Asia',AE:'Asia',TH:'Asia',ID:'Asia',JP:'Asia',NP:'Asia',LK:'Asia',TR:'Asia',
  GB:'Europe',FR:'Europe',US:'North America',
};

function evaluateAchievements(stats: Stats, trips: Trip[]) {
  const conts = new Set<string>();
  trips.forEach(t => [t.from, t.to].forEach(c => { const k = CONTINENT[CITIES[c].cc]; if (k) conts.add(k); }));
  const m: Record<string, number> = {
    total: stats.total, countries: stats.countries, train: stats.train, road: stats.road,
    dist: stats.dist, streakWeeks: PROFILE.streakWeeks,
    longestDist: stats.longest ? stats.longest.dist : 0, continents: conts.size,
  };
  return ACHIEVEMENTS.map(a => ({ ...a, cur: m[a.metric] || 0, pct: Math.min(1, (m[a.metric] || 0) / a.need), unlocked: (m[a.metric] || 0) >= a.need }));
}

const TIER_C: Record<string, string> = { bronze: '#C88A5B', silver: '#C2CBDA', gold: '#F3C46B' };

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { trips, stats, signOut, user, displayName } = useApp();
  const ach = evaluateAchievements(stats, trips);
  const unlocked = ach.filter(a => a.unlocked);
  const next = ach.filter(a => !a.unlocked).sort((a, b) => b.pct - a.pct).slice(0, 2);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={[styles.topbar, { paddingTop: insets.top + 6 }]}>
        <Text style={styles.heading}>Profile</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/settings' as any)}>
          <Icon name="settings" size={20} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: 20 }}>
        {/* Identity */}
        <View style={[styles.row, { gap: 15, marginBottom: 4 }]}>
          <Avatar size={66} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{displayName}</Text>
            <Text style={styles.handle}>{user?.email ?? PROFILE.handle}</Text>
            <View style={[styles.row, { gap: 5, marginTop: 4 }]}>
              <Icon name="pin" size={13} color={Colors.text3} />
              <Text style={styles.location}>{PROFILE.home}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.bio}>{PROFILE.bio}</Text>

        {/* Hero stats */}
        <View style={styles.heroStats}>
          <HeroStat n={stats.countries} l="Countries" />
          <HeroStat n={fmt.km(stats.dist)} l="Kilometres" border />
          <HeroStat n={stats.total} l="Journeys" />
        </View>

        {/* Year in Travel CTA */}
        <LinearGradient colors={['#2a1430', '#3a1d22', '#1a2440']} locations={[0, 0.55, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.wrappedCta}>
          <View style={styles.wrappedSparkle}><Icon name="sparkle" size={120} color={Colors.gold} /></View>
          <Text style={styles.wrappedEyebrow}>Wrapped</Text>
          <Text style={styles.wrappedTitle}>Your 2025 in Travel</Text>
          <Text style={styles.wrappedSub}>A shareable recap of where the year took you.</Text>
          <View style={[styles.row, { gap: 7, marginTop: 13 }]}>
            <Icon name="share" size={17} color={Colors.text} />
            <Text style={styles.wrappedAction}>Create card</Text>
          </View>
        </LinearGradient>

        {/* Detailed stats */}
        <Text style={styles.sectionTitle}>By the numbers</Text>
        <View style={styles.statsCard}>
          <StatLine icon="plane" color={Colors.flight} label="Flights" value={stats.flight}
            sub={fmt.km(trips.filter(t => t.type === 'flight').reduce((s, t) => s + t.dist, 0)) + ' km'} />
          <StatLine icon="train" color={Colors.train} label="Train journeys" value={stats.train}
            sub={fmt.km(trips.filter(t => t.type === 'train').reduce((s, t) => s + t.dist, 0)) + ' km'} />
          <StatLine icon="car" color={Colors.road} label="Road trips" value={stats.road}
            sub={fmt.km(trips.filter(t => t.type === 'road').reduce((s, t) => s + t.dist, 0)) + ' km'} />
          {stats.longest && (
            <StatLine icon="bolt" color={Colors.gold} label="Longest journey"
              value={`${CITIES[stats.longest.from].city}→${CITIES[stats.longest.to].city}`}
              sub={fmt.kmFull(stats.longest.dist) + ' km'} last />
          )}
          <StatLine icon="heart" color={Colors.flight} label="Most visited" value={stats.mostCountry}
            sub={stats.mostCountryCount + ' visits'} last fill />
        </View>

        {/* Badges */}
        <View style={[styles.between, { marginTop: 24, marginBottom: 12 }]}>
          <Text style={styles.sectionTitle}>Badges</Text>
          <Text style={styles.meta3}>{unlocked.length}/{ach.length} earned</Text>
        </View>
        <View style={styles.badgeGrid}>
          {ach.map(a => <Badge key={a.id} achievement={a} />)}
        </View>

        {/* Milestones */}
        <Text style={[styles.sectionTitle, { marginTop: 24, marginBottom: 12 }]}>Next milestones</Text>
        <View style={{ gap: 11 }}>
          {next.map(a => (
            <View key={a.id} style={styles.milestoneCard}>
              <View style={[styles.between, { marginBottom: 9 }]}>
                <View style={styles.row}>
                  <View style={[styles.milestoneIcon, { backgroundColor: Colors.surface2 }]}>
                    <Icon name={a.icon} size={18} color={TIER_C[a.tier]} />
                  </View>
                  <View style={{ marginLeft: 10 }}>
                    <Text style={styles.milestoneName}>{a.name}</Text>
                    <Text style={styles.milestoneDesc}>{a.desc}</Text>
                  </View>
                </View>
                <Text style={styles.milestoneProgress}>
                  {['dist','longestDist'].includes(a.metric) ? fmt.km(a.cur) : a.cur}/
                  {['dist','longestDist'].includes(a.metric) ? fmt.km(a.need) : a.need}
                </Text>
              </View>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: `${a.pct * 100}%` as any, backgroundColor: TIER_C[a.tier] }]} />
              </View>
            </View>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={() => signOut()} activeOpacity={0.8}>
          <Icon name="arrowLeft" size={17} color={Colors.flight} />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
        <Text style={styles.version}>Girok v1.0 · your journey, illustrated</Text>
      </View>
    </ScrollView>
  );
}

function HeroStat({ n, l, border }: { n: number | string; l: string; border?: boolean }) {
  return (
    <View style={[styles.heroStat, border && styles.heroStatBorder]}>
      <Text style={styles.heroStatN}>{n}</Text>
      <Text style={styles.heroStatL}>{l}</Text>
    </View>
  );
}

function StatLine({ icon, color, label, value, sub, last, fill }: any) {
  return (
    <View style={[styles.statLine, !last && { borderBottomWidth: 1, borderBottomColor: Colors.hairline }]}>
      <View style={[styles.statLineIcon, { backgroundColor: Colors.surface2 }]}>
        <Icon name={icon} size={19} color={color} fill={fill || icon === 'plane'} />
      </View>
      <Text style={styles.statLineLabel}>{label}</Text>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.statLineValue}>{value}</Text>
        {sub && <Text style={styles.meta3}>{sub}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  topbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 10 },
  heading: { fontSize: 26, fontWeight: '700', letterSpacing: -0.5, color: Colors.text },
  iconBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.surface2, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center' },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 23, fontWeight: '700', letterSpacing: -0.4, color: Colors.text },
  handle: { fontSize: 13.5, color: Colors.text2 },
  location: { fontSize: 12.5, color: Colors.text3 },
  bio: { fontSize: 14, color: Colors.text2, marginTop: 12, lineHeight: 21 },
  heroStats: { flexDirection: 'row', marginTop: 18, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.hairline, borderRadius: Radii.lg, overflow: 'hidden' },
  heroStat: { flex: 1, alignItems: 'center', paddingVertical: 16, paddingHorizontal: 6 },
  heroStatBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: Colors.hairline },
  heroStatN: { fontSize: 27, fontWeight: '700', letterSpacing: -0.5, color: Colors.text },
  heroStatL: { fontSize: 12, color: Colors.text2 },
  wrappedCta: { borderRadius: Radii.xl, marginTop: 16, padding: 18, overflow: 'hidden', borderWidth: 1, borderColor: Colors.hairline2 },
  wrappedSparkle: { position: 'absolute', right: -10, top: -20, opacity: 0.5 },
  wrappedEyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1.8, textTransform: 'uppercase', color: Colors.gold },
  wrappedTitle: { fontSize: 23, fontWeight: '700', letterSpacing: -0.4, color: Colors.text, marginTop: 5 },
  wrappedSub: { fontSize: 13.5, color: Colors.text2, marginTop: 5, maxWidth: 230 },
  wrappedAction: { fontWeight: '700', fontSize: 14, color: Colors.text },
  sectionTitle: { fontSize: 19, fontWeight: '700', letterSpacing: -0.3, color: Colors.text },
  statsCard: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.hairline, borderRadius: Radii.lg, paddingHorizontal: 16, marginTop: 12 },
  statLine: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 13 },
  statLineIcon: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  statLineLabel: { flex: 1, fontWeight: '600', fontSize: 14.5, color: Colors.text },
  statLineValue: { fontWeight: '700', fontSize: 14.5, color: Colors.text },
  meta3: { fontSize: 11.5, color: Colors.text3 },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 11 },
  milestoneCard: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.hairline, borderRadius: Radii.lg, padding: 14 },
  milestoneIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  milestoneName: { fontWeight: '700', fontSize: 14.5, color: Colors.text },
  milestoneDesc: { fontSize: 12, color: Colors.text2 },
  milestoneProgress: { fontSize: 13, fontWeight: '600', color: Colors.text2 },
  progressBg: { height: 7, borderRadius: 99, backgroundColor: Colors.surface3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 99 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 13, marginTop: 24 },
  logoutText: { fontWeight: '600', fontSize: 15, color: Colors.flight },
  version: { fontSize: 12, color: Colors.text3, textAlign: 'center', marginTop: 4 },
});
