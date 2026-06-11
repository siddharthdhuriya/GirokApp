import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Icon from '@/components/Icon';
import TypeTag from '@/components/TypeTag';
import { Colors, Radii, DARK_MAP_STYLE } from '@/theme';
import { CITIES, TypeMeta } from '@/data';
import { greatCircleCoords, routeRegion } from '@/utils/geo';
import { fmt } from '@/utils/fmt';
import { useApp } from '@/context/AppContext';

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { trips, deleteTrip } = useApp();
  const trip = trips.find(t => t.id === id)!;
  if (!trip) {
    return (
      <View style={styles.screen}>
        <TouchableOpacity style={[styles.backBtn, { top: insets.top + 10 }]} onPress={() => router.back()}>
          <Icon name="arrowLeft" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.notFound}>Trip not found</Text>
      </View>
    );
  }

  const m = TypeMeta[trip.type];
  const coords = greatCircleCoords(trip.from, trip.to);
  const region = routeRegion(trip.from, trip.to);

  function confirmDelete() {
    Alert.alert('Delete this trip?',
      `${CITIES[trip.from].city} → ${CITIES[trip.to].city} will be removed. This can't be undone.`,
      [
        { text: 'Keep', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => { deleteTrip(trip.id); router.back(); } },
      ]
    );
  }

  return (
    <View style={styles.screen}>
      {/* Hero map */}
      <View style={styles.hero}>
        <MapView style={StyleSheet.absoluteFill} provider={PROVIDER_GOOGLE}
          customMapStyle={DARK_MAP_STYLE} initialRegion={region}
          scrollEnabled={false} zoomEnabled={false} pitchEnabled={false} rotateEnabled={false}
          showsCompass={false} toolbarEnabled={false}>
          <Polyline coordinates={coords} strokeColor={m.color} strokeWidth={2} />
          <Marker coordinate={{ latitude: CITIES[trip.from].ll[0], longitude: CITIES[trip.from].ll[1] }} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.pin} />
          </Marker>
          <Marker coordinate={{ latitude: CITIES[trip.to].ll[0], longitude: CITIES[trip.to].ll[1] }} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.pin} />
          </Marker>
        </MapView>
        <View style={[StyleSheet.absoluteFill, styles.heroOverlay]} pointerEvents="none" />
        {/* top buttons */}
        <View style={[styles.heroButtons, { top: insets.top + 10 }]}>
          <TouchableOpacity style={styles.heroBtn} onPress={() => router.back()}>
            <Icon name="arrowLeft" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={styles.heroRight}>
            <TouchableOpacity style={styles.heroBtn}><Icon name="share" size={19} color="#fff" /></TouchableOpacity>
            <TouchableOpacity style={styles.heroBtn}><Icon name="edit" size={19} color="#fff" /></TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1, marginTop: -46 }} contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24 }}>
        <TypeTag type={trip.type} />
        <Text style={styles.title}>{CITIES[trip.from].city} → {CITIES[trip.to].city}</Text>
        <Text style={styles.meta}>{fmt.date(trip.date)} · {trip.carrier}{trip.code ? ` · ${trip.code}` : ''}</Text>

        <View style={styles.statGrid}>
          <MetaTile icon="ruler"  label="Distance" value={fmt.kmFull(trip.dist) + ' km'} color={m.color}         />
          <MetaTile icon="clock"  label="Duration" value={fmt.time(trip.dur)}              color={Colors.text}    />
          <MetaTile icon="seat"   label="Seat"     value={trip.seat}                        color={Colors.text}    />
          <MetaTile icon="star"   label="Class"    value={trip.cls}                          color={Colors.gold}    />
        </View>

        {trip.note && (
          <View style={styles.noteCard}>
            <Text style={styles.noteLabel}>NOTE</Text>
            <Text style={styles.noteText}>"{trip.note}"</Text>
          </View>
        )}

        <TouchableOpacity style={styles.shareBtn} activeOpacity={0.8}>
          <Icon name="share" size={18} color={Colors.text} />
          <Text style={styles.shareBtnText}>Share this trip</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteBtn} onPress={confirmDelete} activeOpacity={0.8}>
          <Icon name="trash" size={17} color={Colors.flight} />
          <Text style={styles.deleteBtnText}>Delete trip</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function MetaTile({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <View style={styles.metaTile}>
      <Icon name={icon} size={18} color={color} />
      <Text style={styles.metaValue}>{value}</Text>
      <Text style={styles.metaLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  notFound: { color: Colors.text2, textAlign: 'center', marginTop: 100, fontSize: 16 },
  hero: { height: 280, backgroundColor: Colors.mapBg },
  heroOverlay: {},
  heroButtons: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  heroRight: { flexDirection: 'row', gap: 9 },
  backBtn: { position: 'absolute', left: 16, width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  pin: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#fff', borderWidth: 2, borderColor: Colors.accent },
  title: { fontSize: 30, fontWeight: '700', letterSpacing: -0.6, color: Colors.text, lineHeight: 33, marginTop: 8 },
  meta: { fontSize: 14.5, color: Colors.text2, marginTop: 6, marginBottom: 18 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metaTile: { flex: 1, minWidth: '44%', backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.hairline, borderRadius: Radii.lg, padding: 16, gap: 8 },
  metaValue: { fontWeight: '700', fontSize: 16.5, color: Colors.text, letterSpacing: -0.2 },
  metaLabel: { fontSize: 12.5, color: Colors.text2 },
  noteCard: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.hairline, borderRadius: Radii.lg, padding: 16, marginTop: 16 },
  noteLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.8, color: Colors.text3, marginBottom: 8 },
  noteText: { fontSize: 18, fontStyle: 'italic', color: Colors.text, lineHeight: 26 },
  shareBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.surface2, borderRadius: Radii.pill, paddingVertical: 13, marginTop: 20, borderWidth: 1, borderColor: Colors.hairline2 },
  shareBtnText: { fontWeight: '600', color: Colors.text, fontSize: 15 },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 13, marginTop: 8 },
  deleteBtnText: { fontWeight: '600', color: Colors.flight, fontSize: 15 },
});
