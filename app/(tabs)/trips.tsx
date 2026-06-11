import React, { useState } from 'react';
import {
  View, Text, SectionList, TouchableOpacity,
  TextInput, ScrollView, StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '@/components/Icon';
import { Colors, Radii } from '@/theme';
import { CITIES, Trip, TripType, TypeMeta } from '@/data';
import { fmt } from '@/utils/fmt';
import { useApp } from '@/context/AppContext';

type Filter = 'all' | TripType;

export default function TripsScreen() {
  const insets = useSafeAreaInsets();
  const { trips } = useApp();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [searching, setSearching] = useState(false);

  const matched = trips.filter(t => {
    if (filter !== 'all' && t.type !== filter) return false;
    if (!query) return true;
    const s = query.toLowerCase();
    return [CITIES[t.from].city, CITIES[t.to].city, CITIES[t.from].country, CITIES[t.to].country, t.carrier, t.code]
      .filter(Boolean).some(x => x!.toLowerCase().includes(s));
  });

  const groups: Record<string, Trip[]> = {};
  matched.forEach(t => { const key = fmt.month(t.date); (groups[key] ||= []).push(t); });
  const sections = Object.entries(groups).map(([title, data]) => ({ title, data }));

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.topbar}>
        <Text style={styles.heading}>Trips</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={() => setSearching(s => !s)}>
          <Icon name={searching ? 'close' : 'search'} size={20} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {searching && (
        <View style={styles.searchWrap}>
          <View style={styles.searchBar}>
            <Icon name="search" size={19} color={Colors.text3} />
            <TextInput style={styles.searchInput} value={query} onChangeText={setQuery}
              placeholder="Search city, carrier, flight no." placeholderTextColor={Colors.text3} autoFocus />
          </View>
        </View>
      )}

      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {[['all', 'All'], ['flight', 'Flights'], ['train', 'Trains'], ['road', 'Road']] .map(([k, l]) => (
          <TouchableOpacity key={k} style={[styles.chip, filter === k && styles.chipActive]}
            onPress={() => setFilter(k as Filter)} activeOpacity={0.8}>
            {k !== 'all' && <View style={[styles.chipDot, { backgroundColor: TypeMeta[k as TripType].color }]} />}
            <Text style={[styles.chipText, filter === k && styles.chipTextActive]}>{l}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {matched.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}><Icon name="search" size={26} color={Colors.text3} /></View>
          <Text style={styles.emptyTitle}>No trips found</Text>
          <Text style={styles.emptySub}>Try a different search or filter.</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 20, paddingTop: 4 }}
          stickySectionHeadersEnabled
          renderSectionHeader={({ section: { title, data } }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{title}</Text>
              <Text style={styles.sectionMeta}>{data.length} · {fmt.km(data.reduce((s, t) => s + t.dist, 0))} km</Text>
            </View>
          )}
          renderItem={({ item: t }) => <TimelineRow trip={t} onPress={() => router.push(`/trip/${t.id}`)} />}
        />
      )}
    </View>
  );
}

function TimelineRow({ trip: t, onPress }: { trip: Trip; onPress: () => void }) {
  const m = TypeMeta[t.type];
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.tlRow}>
      {/* spine */}
      <View style={styles.spine}>
        <View style={[styles.spineDot, { backgroundColor: m.color, shadowColor: m.color }]} />
        <View style={styles.spineLine} />
      </View>
      <View style={[styles.card, { marginBottom: 12 }]}>
        <View style={{ flex: 1 }}>
          <View style={styles.routeLine}>
            <Text style={styles.cityText}>{CITIES[t.from].city}</Text>
            <Icon name="arrowRight" size={14} color={Colors.text3} />
            <Text style={styles.cityText}>{CITIES[t.to].city}</Text>
            {t.fav && <Icon name="heart" size={13} color={Colors.flight} fill />}
          </View>
          <View style={[styles.metaRow, { gap: 8 }]}>
            <Text style={styles.metaText}>{fmt.dateShort(t.date)}</Text>
            <Text style={styles.dot}>·</Text>
            <Text style={styles.metaText} numberOfLines={1}>{t.carrier}</Text>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Icon name={t.type === 'flight' ? 'plane' : t.type === 'train' ? 'train' : 'car'}
            size={18} color={m.color} fill={t.type === 'flight'} />
          <Text style={styles.distText}>{fmt.km(t.dist)} km</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  topbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 6, paddingBottom: 10 },
  heading: { fontSize: 26, fontWeight: '700', letterSpacing: -0.5, color: Colors.text },
  iconBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.surface2, alignItems: 'center', justifyContent: 'center' },
  searchWrap: { paddingHorizontal: 20, paddingBottom: 4 },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.surface2, borderRadius: Radii.md, paddingHorizontal: 14 },
  searchInput: { flex: 1, color: Colors.text, padding: 12, fontSize: 15 },
  chips: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingTop: 6, paddingBottom: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 13, paddingVertical: 7, backgroundColor: Colors.surface2, borderRadius: 99, borderWidth: 1, borderColor: 'transparent' },
  chipActive: { backgroundColor: Colors.text },
  chipDot: { width: 8, height: 8, borderRadius: 4 },
  chipText: { fontSize: 13, fontWeight: '600', color: Colors.text2 },
  chipTextActive: { color: Colors.bg },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIcon: { width: 60, height: 60, borderRadius: 18, backgroundColor: Colors.surface2, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontWeight: '600', fontSize: 16, color: Colors.text2 },
  emptySub: { fontSize: 13.5, color: Colors.text3, marginTop: 4 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.bg, paddingTop: 10, paddingBottom: 6 },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1.8, textTransform: 'uppercase', color: Colors.text3 },
  sectionMeta: { fontSize: 12, color: Colors.text3 },
  tlRow: { flexDirection: 'row', gap: 14 },
  spine: { flexDirection: 'column', alignItems: 'center', paddingTop: 4 },
  spineDot: { width: 11, height: 11, borderRadius: 6, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 4, elevation: 4 },
  spineLine: { flex: 1, width: 2, backgroundColor: Colors.hairline, marginTop: 4 },
  card: { flex: 1, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.hairline, borderRadius: Radii.lg, padding: 13, flexDirection: 'row', gap: 13, alignItems: 'center' },
  routeLine: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cityText: { fontWeight: '700', fontSize: 15.5, color: Colors.text, letterSpacing: -0.2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  metaText: { fontSize: 12.5, color: Colors.text2 },
  dot: { color: Colors.text3 },
  distText: { fontSize: 11.5, color: Colors.text3, marginTop: 3 },
});
