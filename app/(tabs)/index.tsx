import React, { useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '@/components/Icon';
import Avatar from '@/components/Avatar';
import TripRow from '@/components/TripRow';
import StatTile from '@/components/StatTile';
import ModeBar from '@/components/ModeBar';
import Flag from '@/components/Flag';
import { Colors, Radii, DARK_MAP_STYLE } from '@/theme';
import { CITIES, PROFILE, TypeMeta } from '@/data';
import { fmt } from '@/utils/fmt';
import MapView, { Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useApp } from '@/context/AppContext';
import { greatCircleCoords } from '@/utils/geo';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { trips, stats, displayName } = useApp();
  const recent = trips.slice(0, 4);
  const mapRegion = useMemo(() => {
    if (trips.length === 0) return { latitude: 20, longitude: 40, latitudeDelta: 100, longitudeDelta: 160 };
    const lats = trips.flatMap(t => [CITIES[t.from].ll[0], CITIES[t.to].ll[0]]);
    const lons = trips.flatMap(t => [CITIES[t.from].ll[1], CITIES[t.to].ll[1]]);
    const minLat = Math.min(...lats), maxLat = Math.max(...lats);
    const minLon = Math.min(...lons), maxLon = Math.max(...lons);
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLon + maxLon) / 2,
      latitudeDelta: Math.max(maxLat - minLat + 15, 30),
      longitudeDelta: Math.max(maxLon - minLon + 15, 60),
    };
  }, [trips]);

  const countries = [...new Set(trips.flatMap(t => [t.from, t.to]).map(c => CITIES[c]))]
    .reduce<Record<string, string>>((m, c) => { m[c.cc] = c.country; return m; }, {});
  const ccList = Object.keys(countries);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: 28 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.topbar, { paddingTop: insets.top + 12 }]}>
        <View>
          <Text style={styles.greet}>{greeting()},</Text>
          <Text style={styles.name}>{displayName.split(' ')[0]}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn}><Icon name="bell" size={20} color={Colors.text} /></TouchableOpacity>
          <Avatar size={42} letter={displayName[0]?.toUpperCase()} onPress={() => router.push('/(tabs)/profile')} />
        </View>
      </View>

      {/* Hero map card */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.mapCard}
          onPress={() => router.push('/(tabs)/map')}
          activeOpacity={0.9}
        >
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <MapView
              style={StyleSheet.absoluteFill}
              provider={PROVIDER_GOOGLE}
              customMapStyle={DARK_MAP_STYLE}
              initialRegion={mapRegion}
              scrollEnabled={false}
              zoomEnabled={false}
              pitchEnabled={false}
              rotateEnabled={false}
              showsCompass={false}
              toolbarEnabled={false}
              liteMode
            >
              {trips.map(t => (
                <Polyline
                  key={t.id}
                  coordinates={greatCircleCoords(t.from, t.to)}
                  strokeColor={TypeMeta[t.type].color}
                  strokeWidth={1.5}
                />
              ))}
            </MapView>
          </View>
          <LinearGradient
            colors={['transparent', 'rgba(9,11,17,0.85)']}
            locations={[0.4, 1]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.mapCardContent}>
            <View>
              <Text style={styles.eyebrow}>Your atlas</Text>
              <Text style={styles.mapCardStat}>{stats.countries} countries · {fmt.kmFull(stats.dist)} km</Text>
            </View>
            <View style={styles.exploreBtn}>
              <Text style={styles.exploreBtnText}>Explore</Text>
              <Icon name="arrowRight" size={15} color={Colors.text} />
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Streak */}
      <View style={styles.section}>
        <View style={styles.card}>
          <View style={[styles.streakIcon, { backgroundColor: Colors.flightSoft }]}>
            <Icon name="flame" size={24} color={Colors.flight} fill />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.streakTitle}>{PROFILE.streakWeeks}-week travel streak</Text>
            <Text style={styles.streakSub}>One trip a week keeps the map glowing.</Text>
          </View>
          <View style={styles.streakDots}>
            {Array.from({ length: 7 }).map((_, i) => (
              <View key={i} style={[styles.streakDot, { backgroundColor: i < PROFILE.streakWeeks ? Colors.flight : Colors.surface3 }]} />
            ))}
          </View>
        </View>
      </View>

      {/* Stat grid */}
      <View style={styles.section}>
        <View style={styles.statGrid}>
          <StatTile num={stats.total}            label="Total trips" icon="compass" />
          <StatTile num={fmt.km(stats.dist)}     label="Kilometres"  icon="ruler"   accent={Colors.flight} />
          <StatTile num={stats.countries}        label="Countries"   icon="globe"   accent={Colors.train}  />
          <StatTile num={stats.cities}           label="Cities"      icon="pin"     accent={Colors.road}   />
        </View>
      </View>

      {/* How you move */}
      <View style={styles.section}>
        <View style={[styles.card, { padding: 15 }]}>
          <View style={styles.between}>
            <Text style={styles.sectionTitle}>How you move</Text>
            <Text style={styles.muted3}>{stats.total} journeys</Text>
          </View>
          <View style={{ marginTop: 13 }}>
            <ModeBar stats={stats} />
          </View>
          <View style={[styles.row, { gap: 16, marginTop: 13 }]}>
            <LegendItem color={Colors.flight} label="Flights" n={stats.flight} />
            <LegendItem color={Colors.train}  label="Trains"  n={stats.train}  />
            <LegendItem color={Colors.road}   label="Road"    n={stats.road}   />
          </View>
        </View>
      </View>

      {/* Recent trips */}
      <View style={styles.section}>
        <View style={[styles.between, { marginBottom: 2 }]}>
          <Text style={styles.sectionTitle2}>Jump back in</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/trips')}>
            <Text style={styles.seeAll}>All trips</Text>
          </TouchableOpacity>
        </View>
        <View>
          {recent.map((t, i) => (
            <TripRow key={t.id} trip={t} onPress={() => router.push(`/trip/${t.id}`)} last={i === recent.length - 1} />
          ))}
        </View>
      </View>

      {/* Scan CTA */}
      <View style={styles.section}>
        <TouchableOpacity onPress={() => router.push('/add')} activeOpacity={0.88}>
          <LinearGradient
            colors={[Colors.accent, 'rgba(180,50,20,0.9)']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.scanCta}
          >
            <View style={styles.scanCtaQr}><Icon name="scan" size={120} color="rgba(255,255,255,0.22)" /></View>
            <Text style={styles.eyebrowLight}>Add in seconds</Text>
            <Text style={styles.scanCtaTitle}>Scan a boarding pass</Text>
            <Text style={styles.scanCtaSub}>We'll read the route, date and seat for you.</Text>
            <View style={[styles.row, { gap: 7, marginTop: 14 }]}>
              <Icon name="scan" size={19} color="#fff" />
              <Text style={styles.scanCtaAction}>Open scanner</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Countries */}
      <View>
        <View style={[styles.between, styles.section]}>
          <Text style={styles.sectionTitle2}>Countries collected</Text>
          <Text style={styles.muted3}>{ccList.length}</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
          {ccList.map(cc => (
            <View key={cc} style={styles.chip}>
              <Flag cc={cc} />
              <Text style={styles.chipText}>{countries[cc]}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
}

function LegendItem({ color, label, n }: { color: string; label: string; n: number }) {
  return (
    <View style={styles.row}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendN}>{n}</Text>
      <Text style={styles.muted3}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  topbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 10 },
  greet: { fontSize: 13.5, color: Colors.text2 },
  name: { fontSize: 24, fontWeight: '700', color: Colors.text, letterSpacing: -0.4 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.surface2, alignItems: 'center', justifyContent: 'center' },
  section: { paddingHorizontal: 20, marginTop: 14 },
  mapCard: { height: 226, borderRadius: Radii.xl, overflow: 'hidden', backgroundColor: Colors.mapBg, justifyContent: 'flex-end' },
  mapCardContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', padding: 16 },
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1.8, textTransform: 'uppercase', color: Colors.text3, marginBottom: 5 },
  eyebrowLight: { fontSize: 11, fontWeight: '700', letterSpacing: 1.8, textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' },
  mapCardStat: { fontSize: 19, fontWeight: '700', color: Colors.text, letterSpacing: -0.3 },
  exploreBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 99 },
  exploreBtnText: { fontSize: 13, fontWeight: '600', color: Colors.text },
  card: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.hairline, borderRadius: Radii.lg, flexDirection: 'row', alignItems: 'center', gap: 13, padding: 13 },
  streakIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  streakTitle: { fontWeight: '700', fontSize: 15, color: Colors.text },
  streakSub: { fontSize: 12.5, color: Colors.text2 },
  streakDots: { flexDirection: 'row', gap: 3 },
  streakDot: { width: 6, height: 18, borderRadius: 99 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  sectionTitle: { fontWeight: '700', fontSize: 14.5, color: Colors.text },
  sectionTitle2: { fontSize: 19, fontWeight: '700', color: Colors.text, letterSpacing: -0.3 },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center' },
  muted3: { fontSize: 12.5, color: Colors.text3 },
  seeAll: { fontSize: 13.5, fontWeight: '600', color: Colors.text2 },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 7 },
  legendN: { fontSize: 13, fontWeight: '600', color: Colors.text, marginRight: 4 },
  scanCta: { borderRadius: Radii.xl, padding: 20, overflow: 'hidden' },
  scanCtaQr: { position: 'absolute', right: -14, top: -14 },
  scanCtaTitle: { fontSize: 22, fontWeight: '700', color: '#fff', marginTop: 5, maxWidth: 220, letterSpacing: -0.3 },
  scanCtaSub: { fontSize: 13.5, color: 'rgba(255,255,255,0.86)', marginTop: 6, maxWidth: 230 },
  scanCtaAction: { fontWeight: '700', fontSize: 14.5, color: '#fff' },
  chipScroll: { paddingHorizontal: 20, gap: 8, paddingVertical: 4 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 9, paddingVertical: 7, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.hairline, borderRadius: 99 },
  chipText: { fontSize: 13, fontWeight: '600', color: Colors.text2 },
});
