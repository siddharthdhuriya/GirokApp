import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Icon from '@/components/Icon';
import TypeTag from '@/components/TypeTag';
import { Colors, Radii, DARK_MAP_STYLE } from '@/theme';
import { CITIES, Trip, TripType, TypeMeta } from '@/data';
import { greatCircleCoords, routeRegion } from '@/utils/geo';
import { fmt } from '@/utils/fmt';
import { useApp } from '@/context/AppContext';

type Filter = Record<TripType, boolean>;

const WORLD_REGION = { latitude: 20, longitude: 0, latitudeDelta: 100, longitudeDelta: 160 };

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const { trips } = useApp();
  const mapRef = useRef<MapView>(null);
  const [filter, setFilter] = useState<Filter>({ flight: true, train: true, road: true });
  const [selected, setSelected] = useState<Trip | null>(null);
  const allOn = filter.flight && filter.train && filter.road;

  function toggle(k: TripType) {
    if (allOn) {
      setFilter({ flight: k === 'flight', train: k === 'train', road: k === 'road' });
      return;
    }
    const next = { ...filter, [k]: !filter[k] };
    if (!next.flight && !next.train && !next.road) setFilter({ flight: true, train: true, road: true });
    else setFilter(next);
  }

  function selectTrip(t: Trip) {
    setSelected(t);
    const region = routeRegion(t.from, t.to);
    mapRef.current?.animateToRegion(region, 600);
  }

  const shown = trips.filter(t => filter[t.type]);

  return (
    <View style={styles.screen}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        customMapStyle={DARK_MAP_STYLE}
        initialRegion={WORLD_REGION}
        showsCompass={false}
        showsScale={false}
        toolbarEnabled={false}
      >
        {shown.map(t => {
          const coords = greatCircleCoords(t.from, t.to);
          const m = TypeMeta[t.type];
          const isSel = selected?.id === t.id;
          const fade = selected && !isSel ? 0.18 : 1;
          return (
            <React.Fragment key={t.id}>
              {/* glow */}
              <Polyline coordinates={coords} strokeColor={m.color} strokeWidth={isSel ? 5 : 3.5}
                strokeColors={[m.color]} lineDashPattern={undefined} tappable
                onPress={() => selectTrip(t)} />
              {/* crisp line */}
              <Polyline coordinates={coords} strokeColor={m.color} strokeWidth={isSel ? 2.2 : 1.5}
                tappable onPress={() => selectTrip(t)} />
              <Marker coordinate={{ latitude: CITIES[t.from].ll[0], longitude: CITIES[t.from].ll[1] }}
                onPress={() => selectTrip(t)} anchor={{ x: 0.5, y: 0.5 }}>
                <View style={styles.pin} />
              </Marker>
              <Marker coordinate={{ latitude: CITIES[t.to].ll[0], longitude: CITIES[t.to].ll[1] }}
                onPress={() => selectTrip(t)} anchor={{ x: 0.5, y: 0.5 }}>
                <View style={styles.pin} />
              </Marker>
            </React.Fragment>
          );
        })}
      </MapView>

      {/* Top chrome */}
      <View style={[styles.topChrome, { paddingTop: insets.top + 2 }]}>
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.title}>World map</Text>
            <Text style={styles.subtitle}>{shown.length} journeys shown</Text>
          </View>
          <TouchableOpacity style={styles.iconBtn}><Icon name="search" size={20} color={Colors.text} /></TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          <FilterChip label="All" active={allOn} onPress={() => setFilter({ flight: true, train: true, road: true })} />
          {(['flight', 'train', 'road'] as TripType[]).map(k => (
            <FilterChip key={k} label={k === 'flight' ? 'Flights' : k === 'train' ? 'Trains' : 'Road'}
              active={!allOn && filter[k]} dotColor={TypeMeta[k].color} onPress={() => toggle(k)} />
          ))}
        </ScrollView>
      </View>

      {/* Hint */}
      {!selected && (
        <View style={styles.hintWrap}>
          <Text style={styles.hint}>Tap a route for details · pinch to zoom</Text>
        </View>
      )}

      {/* Route detail sheet */}
      {selected && (
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.sheetGrab} />
          <RouteDetail trip={selected} onClose={() => setSelected(null)} onOpen={() => router.push(`/trip/${selected.id}`)} />
        </View>
      )}
    </View>
  );
}

function FilterChip({ label, active, dotColor, onPress }: { label: string; active: boolean; dotColor?: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
      activeOpacity={0.8}
    >
      {dotColor && <View style={[styles.chipDot, { backgroundColor: dotColor }]} />}
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function RouteDetail({ trip: t, onClose, onOpen }: { trip: Trip; onClose: () => void; onOpen: () => void }) {
  const m = TypeMeta[t.type];
  return (
    <View style={{ paddingHorizontal: 20 }}>
      <View style={[styles.row, { gap: 10, marginBottom: 16 }]}>
        <TypeTag type={t.type} />
        <Text style={styles.detailDate}>{fmt.date(t.date)}</Text>
        {t.fav && <View style={{ marginLeft: 'auto' }}><Icon name="heart" size={15} color={Colors.flight} fill /></View>}
      </View>
      {/* Route */}
      <View style={[styles.row, { gap: 14, marginBottom: 18 }]}>
        <View style={{ minWidth: 64 }}>
          <Text style={styles.iata}>{t.from.replace('_IN', '')}</Text>
          <Text style={styles.citySmall}>{CITIES[t.from].city}</Text>
        </View>
        <View style={{ flex: 1, height: 2, backgroundColor: Colors.surface3, borderRadius: 2 }}>
          <View style={[StyleSheet.absoluteFill, { backgroundColor: m.color, borderRadius: 2 }]} />
        </View>
        <View style={{ minWidth: 64, alignItems: 'flex-end' }}>
          <Text style={styles.iata}>{t.to.replace('_IN', '')}</Text>
          <Text style={styles.citySmall}>{CITIES[t.to].city}</Text>
        </View>
      </View>
      {/* Meta grid */}
      <View style={styles.metaGrid}>
        <MetaCell label="Distance" value={fmt.kmFull(t.dist) + ' km'} />
        <MetaCell label="Duration" value={fmt.time(t.dur)} />
        <MetaCell label={t.type === 'flight' ? 'Carrier' : t.type === 'train' ? 'Service' : 'Vehicle'} value={t.carrier} />
        <MetaCell label={t.code ? 'Number' : 'Class'} value={t.code || t.cls} />
      </View>
      {t.note && <Text style={styles.note}>"{t.note}"</Text>}
      <View style={[styles.row, { gap: 10, marginTop: 18 }]}>
        <TouchableOpacity style={styles.btnGhost} onPress={onOpen} activeOpacity={0.8}>
          <Text style={styles.btnGhostText}>View full trip</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnShare} onPress={onClose} activeOpacity={0.8}>
          <Icon name="share" size={19} color={Colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaCell}>
      <Text style={styles.metaLabel}>{label.toUpperCase()}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.mapBg },
  topChrome: { padding: 16 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: 23, fontWeight: '700', color: Colors.text, letterSpacing: -0.4,
    textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 12 },
  subtitle: { fontSize: 12.5, color: Colors.text2,
    textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 8 },
  iconBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.hairline, alignItems: 'center', justifyContent: 'center' },
  filters: { flexDirection: 'row', gap: 8, paddingTop: 14 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 13, paddingVertical: 7,
    backgroundColor: Colors.surface, borderRadius: 99, borderWidth: 1, borderColor: Colors.hairline },
  chipActive: { backgroundColor: Colors.text, borderColor: Colors.text },
  chipDot: { width: 8, height: 8, borderRadius: 4 },
  chipText: { fontSize: 13, fontWeight: '600', color: Colors.text2 },
  chipTextActive: { color: Colors.bg },
  pin: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#fff', borderWidth: 2, borderColor: Colors.accent },
  hintWrap: { position: 'absolute', bottom: 18, left: 0, right: 0, alignItems: 'center' },
  hint: { fontSize: 12.5, color: Colors.text2, backgroundColor: Colors.surface, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99, borderWidth: 1, borderColor: Colors.hairline, overflow: 'hidden' },
  sheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.surface, borderTopLeftRadius: Radii.xl, borderTopRightRadius: Radii.xl, borderTopWidth: 1, borderTopColor: Colors.hairline2, paddingTop: 10 },
  sheetGrab: { width: 38, height: 5, borderRadius: 99, backgroundColor: Colors.hairline2, alignSelf: 'center', marginBottom: 14 },
  row: { flexDirection: 'row', alignItems: 'center' },
  detailDate: { fontSize: 13, color: Colors.text2 },
  iata: { fontSize: 24, fontWeight: '700', color: Colors.text, letterSpacing: -0.2 },
  citySmall: { fontSize: 12.5, color: Colors.text2 },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', borderRadius: Radii.md, overflow: 'hidden', borderWidth: 1, borderColor: Colors.hairline, backgroundColor: Colors.hairline },
  metaCell: { width: '50%', backgroundColor: Colors.surface, padding: 13 },
  metaLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.4, color: Colors.text3, marginBottom: 4 },
  metaValue: { fontSize: 14.5, fontWeight: '700', color: Colors.text },
  note: { fontSize: 17, fontStyle: 'italic', color: Colors.text2, marginTop: 16, lineHeight: 24 },
  btnGhost: { flex: 1, backgroundColor: Colors.surface2, borderRadius: Radii.pill, paddingVertical: 13, alignItems: 'center', borderWidth: 1, borderColor: Colors.hairline2 },
  btnGhostText: { fontWeight: '600', color: Colors.text, fontSize: 15 },
  btnShare: { width: 54, height: 48, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: Colors.hairline2, borderRadius: Radii.pill },
});
