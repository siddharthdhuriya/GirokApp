import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, Platform, FlatList,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Icon from '@/components/Icon';
import TypeTag from '@/components/TypeTag';
import Flag from '@/components/Flag';
import { Colors, Radii } from '@/theme';
import { CITIES, Trip, TripType, TypeMeta, SAMPLE_DOCS } from '@/data';
import { distanceKm } from '@/utils/geo';
import { fmt } from '@/utils/fmt';
import { useApp } from '@/context/AppContext';

// ── BCBP (IATA Resolution 792) boarding pass parser ──────────────────────────
const AIRLINE_NAMES: Record<string, string> = {
  SQ: 'Singapore Airlines', EK: 'Emirates', NH: 'ANA', AI: 'Air India',
  '6E': 'IndiGo', BA: 'British Airways', AF: 'Air France', TG: 'Thai Airways',
  GA: 'Garuda Indonesia', UK: 'Vistara', UL: 'SriLankan Airlines',
  TK: 'Turkish Airlines', QR: 'Qatar Airways', EY: 'Etihad Airways',
  LH: 'Lufthansa', SG: 'SpiceJet', IX: 'Air India Express',
  FZ: 'flydubai', AK: 'AirAsia', TR: 'Scoot', MH: 'Malaysia Airlines',
  EI: 'Aer Lingus', KL: 'KLM', OS: 'Austrian', SK: 'SAS', AY: 'Finnair',
};

const COMPARTMENT_CLASS: Record<string, string> = {
  F: 'First', A: 'First', P: 'First',
  J: 'Business', C: 'Business', D: 'Business', I: 'Business', Z: 'Business',
  W: 'Premium Economy', E: 'Premium Economy',
};

function julianToDate(julian: string): string {
  const doy = parseInt(julian, 10);
  if (isNaN(doy) || doy < 1 || doy > 366) return new Date().toISOString().slice(0, 10);
  const now = new Date();
  let year = now.getFullYear();
  const build = (y: number) => new Date(y, 0, doy);
  if (build(year).getTime() < now.getTime() - 7 * 24 * 60 * 60 * 1000) year += 1;
  return build(year).toISOString().slice(0, 10);
}

function parseBCBP(raw: string): Partial<Trip> | null {
  // Mandatory section starts with 'M', minimum 58 chars
  if (!raw || raw[0] !== 'M' || raw.length < 58) return null;
  try {
    const from        = raw.slice(30, 33).trim().toUpperCase();
    const to          = raw.slice(33, 36).trim().toUpperCase();
    const carrierCode = raw.slice(36, 39).trim().toUpperCase();
    const flightNum   = raw.slice(39, 44).trim().replace(/^0+/, '');
    const dateJulian  = raw.slice(44, 47);
    const compartment = (raw[47] ?? 'Y').toUpperCase();
    const seatRaw     = raw.slice(48, 52).trim();
    return {
      type: 'flight',
      from, to,
      carrier: AIRLINE_NAMES[carrierCode] ?? carrierCode,
      code: carrierCode + flightNum,
      seat: seatRaw || '—',
      cls: COMPARTMENT_CLASS[compartment] ?? 'Economy',
      date: julianToDate(dateJulian),
      dur: 0,
    };
  } catch { return null; }
}

type Step = 'scanner' | 'parsing' | 'confirm' | 'manual' | 'success';

export default function AddScreen() {
  const insets = useSafeAreaInsets();
  const { addTrip } = useApp();
  const [step, setStep] = useState<Step>('scanner');
  const [draft, setDraft] = useState<Partial<Trip> | null>(null);

  function startParsing(d: Partial<Trip>) {
    setDraft(d);
    setStep('parsing');
    setTimeout(() => setStep('confirm'), 1900);
  }

  function simulate(kind: 'flight' | 'train') {
    const doc = SAMPLE_DOCS[kind];
    startParsing({ ...doc, dist: distanceKm(doc.from!, doc.to!) });
  }

  function startManual() {
    setDraft({ type: 'road', from: 'DEL', to: 'IXL', date: new Date().toISOString().slice(0, 10), carrier: '', seat: '—', cls: 'Self-drive', dur: 0, note: '' });
    setStep('manual');
  }

  function commit(t: Partial<Trip>) {
    const full: Trip = { ...t as Trip, id: 'T' + Date.now(), dist: distanceKm(t.from!, t.to!) };
    addTrip(full);
    setDraft(full);
    setStep('success');
  }

  return (
    <View style={[s.screen, { backgroundColor: step === 'scanner' || step === 'success' ? '#05060a' : Colors.bg }]}>
      {step === 'scanner' && <ScannerStep onSim={simulate} onParsed={startParsing} onManual={startManual} onClose={() => router.back()} insets={insets} />}
      {step === 'parsing' && <ParsingStep />}
      {step === 'confirm' && draft && <ConfirmStep draft={draft} onEdit={() => setStep('manual')} onSave={() => commit(draft)} onClose={() => router.back()} insets={insets} />}
      {step === 'manual' && draft && <ManualStep draft={draft} setDraft={setDraft} onSave={() => commit(draft)} onBack={() => router.back()} insets={insets} />}
      {step === 'success' && draft && <SuccessStep trip={draft as Trip} onDone={() => router.back()} onMap={() => { router.back(); router.push('/(tabs)/map'); }} insets={insets} />}
    </View>
  );
}

/* ---- Scanner ---- */
function ScannerStep({ onSim, onParsed, onManual, onClose, insets }: any) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => { if (!permission?.granted) requestPermission(); }, []);

  function handleScan({ data }: { data: string }) {
    if (scanned) return;
    setScanned(true);
    const parsed = parseBCBP(data);
    if (parsed && CITIES[parsed.from!] && CITIES[parsed.to!]) {
      onParsed({ ...parsed, dist: distanceKm(parsed.from!, parsed.to!) });
    } else {
      onSim('flight');
    }
  }

  return (
    <View style={StyleSheet.absoluteFill}>
      {permission?.granted ? (
        <CameraView style={StyleSheet.absoluteFill} facing="back" onBarcodeScanned={scanned ? undefined : handleScan}
          barcodeScannerSettings={{ barcodeTypes: ['aztec', 'pdf417', 'qr', 'code128'] }} />
      ) : (
        <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', backgroundColor: '#1c2230' }]}>
          <Icon name="camera" size={48} color={Colors.text3} />
          <Text style={[s.scanText, { marginTop: 16 }]}>Camera permission required</Text>
        </View>
      )}
      <View style={[StyleSheet.absoluteFill, { opacity: 0.5, backgroundColor: 'transparent' }]} pointerEvents="none">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} />
      </View>

      {/* header */}
      <View style={[s.scanHeader, { paddingTop: insets.top + 2 }]}>
        <TouchableOpacity style={s.scanBtn} onPress={onClose}><Icon name="close" size={20} color="#fff" /></TouchableOpacity>
        <Text style={s.scanTitle}>Scan document</Text>
        <TouchableOpacity style={s.scanBtn}><Icon name="image" size={20} color="#fff" /></TouchableOpacity>
      </View>

      {/* reticle */}
      <View style={s.reticleWrap}>
        <View style={s.reticle}>
          {[{top:0,left:0,btw:0,blw:3},{top:0,right:0,btw:0,brw:3},{bottom:0,left:0,bbw:3,blw:3},{bottom:0,right:0,bbw:3,brw:3}].map((p, i) => (
            <View key={i} style={[s.corner, p as any]} />
          ))}
        </View>
        <Text style={s.scanHint}>Line up the QR code on your pass</Text>
      </View>

      {/* demo buttons */}
      <View style={[s.scanFooter, { paddingBottom: insets.bottom + 28 }]}>
        <Text style={s.demoLabel}>Demo · try a sample</Text>
        <View style={s.demoRow}>
          <TouchableOpacity style={s.demoBtn} onPress={() => onSim('flight')} activeOpacity={0.8}>
            <Icon name="plane" size={18} color="#fff" fill /><Text style={s.demoBtnText}>Boarding pass</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.demoBtn} onPress={() => onSim('train')} activeOpacity={0.8}>
            <Icon name="train" size={18} color="#fff" /><Text style={s.demoBtnText}>Train ticket</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={s.manualBtn} onPress={onManual} activeOpacity={0.8}>
          <Icon name="edit" size={17} color="#fff" />
          <Text style={s.manualBtnText}>Enter manually instead</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ---- Parsing ---- */
function ParsingStep() {
  const fields = [['Carrier','Singapore Airlines'],['Number','SQ423'],['From','Mumbai'],['To','Singapore'],['Date','12 May 2026'],['Seat','14A']];
  const [n, setN] = useState(0);
  useEffect(() => { const id = setInterval(() => setN(x => Math.min(x + 1, fields.length)), 240); return () => clearInterval(id); }, []);
  return (
    <View style={s.parseWrap}>
      <ActivityIndicator size="large" color={Colors.accent} style={{ marginBottom: 20 }} />
      <Text style={s.parseTitle}>Reading your pass…</Text>
      <Text style={s.parseSub}>Extracting journey details</Text>
      <View style={[s.parseCard, { marginTop: 24, width: '100%' }]}>
        {fields.map(([k, v], i) => (
          <View key={k} style={[s.parseRow, i < fields.length - 1 && { borderBottomWidth: 1, borderBottomColor: Colors.hairline }]}>
            <Text style={s.parseKey}>{k}</Text>
            {i < n ? <Text style={s.parseVal}>{v}</Text> : <View style={s.skeleton} />}
          </View>
        ))}
      </View>
    </View>
  );
}

/* ---- Confirm ---- */
function ConfirmStep({ draft, onEdit, onSave, onClose, insets }: any) {
  const m = TypeMeta[draft.type as TripType];
  return (
    <View style={StyleSheet.absoluteFill}>
      <View style={[s.header, { paddingTop: insets.top + 2 }]}>
        <TouchableOpacity style={s.headerBtn} onPress={onClose}><Icon name="close" size={20} color={Colors.text} /></TouchableOpacity>
        <Text style={s.headerTitle}>Confirm trip</Text>
        <View style={{ width: 42 }} />
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        <View style={[s.row, { gap: 8, marginBottom: 14 }]}>
          <Icon name="checkCircle" size={17} color={Colors.road} /><Text style={s.scannedOk}>Scanned successfully</Text>
        </View>
        {/* Boarding pass card */}
        <View style={[s.bpCard, { backgroundColor: Colors.surface, borderColor: Colors.hairline }]}>
          <View style={[s.bpTop, { backgroundColor: m.soft }]}>
            <View style={s.between}>
              <TypeTag type={draft.type} />
              <Text style={s.bpDate}>{fmt.date(draft.date)}</Text>
            </View>
            <View style={[s.between, { marginTop: 14, alignItems: 'flex-end' }]}>
              <View>
                <Text style={s.bpIata}>{draft.from?.replace('_IN', '')}</Text>
                <Text style={s.bpCity}>{CITIES[draft.from]?.city}</Text>
              </View>
              <Icon name={draft.type === 'flight' ? 'plane' : draft.type === 'train' ? 'train' : 'car'} size={22} color={m.color} fill={draft.type === 'flight'} />
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={s.bpIata}>{draft.to?.replace('_IN', '')}</Text>
                <Text style={s.bpCity}>{CITIES[draft.to]?.city}</Text>
              </View>
            </View>
          </View>
          <View style={s.bpMeta}>
            {[['Carrier', draft.carrier], ['No.', draft.code || '—'], ['Seat', draft.seat]].map(([k, v]) => (
              <View key={k} style={s.bpMetaCell}>
                <Text style={s.bpMetaLabel}>{k}</Text>
                <Text style={s.bpMetaVal}>{v}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={[s.distCard, { marginTop: 13 }]}>
          <Icon name="ruler" size={20} color={m.color} />
          <View style={{ flex: 1 }}>
            <Text style={s.distVal}>{fmt.kmFull(draft.dist)} km · {fmt.time(draft.dur)}</Text>
            <Text style={s.distSub}>Adds to your total distance</Text>
          </View>
        </View>
        <TouchableOpacity style={s.editBtn} onPress={onEdit} activeOpacity={0.8}>
          <Icon name="edit" size={16} color={Colors.accent} /><Text style={s.editBtnText}>Edit details</Text>
        </TouchableOpacity>
      </ScrollView>
      <View style={[s.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity style={s.savePrimary} onPress={onSave} activeOpacity={0.85}>
          <Text style={s.savePrimaryText}>Save to my atlas</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ---- Manual form ---- */
function ManualStep({ draft, setDraft, onSave, onBack, insets }: any) {
  const [showPicker, setShowPicker] = useState<'from' | 'to' | null>(null);
  const [search, setSearch] = useState('');
  const set = (k: string, v: any) => setDraft((d: any) => ({ ...d, [k]: v }));
  const valid = draft.from && draft.to && draft.from !== draft.to && draft.date;

  const cityList = Object.entries(CITIES).filter(([k, c]) =>
    k !== (showPicker === 'from' ? draft.to : draft.from) &&
    (c.city.toLowerCase().includes(search.toLowerCase()) || c.country.toLowerCase().includes(search.toLowerCase()))
  );

  if (showPicker) {
    return (
      <View style={[StyleSheet.absoluteFill, { backgroundColor: Colors.bg, padding: 20 }]}>
        <View style={[s.header, { paddingTop: insets.top + 2, paddingHorizontal: 0, marginBottom: 12 }]}>
          <TouchableOpacity onPress={() => { setShowPicker(null); setSearch(''); }}><Icon name="chevL" size={22} color={Colors.text} /></TouchableOpacity>
          <Text style={s.headerTitle}>Choose a place</Text>
          <View style={{ width: 42 }} />
        </View>
        <View style={s.searchBar}>
          <Icon name="search" size={19} color={Colors.text3} />
          <TextInput style={s.searchInput} value={search} onChangeText={setSearch} placeholder="City or country" placeholderTextColor={Colors.text3} autoFocus />
        </View>
        <FlatList
          data={cityList}
          keyExtractor={([k]) => k}
          renderItem={({ item: [k, c] }) => (
            <TouchableOpacity style={s.cityRow} onPress={() => { set(showPicker, k); setShowPicker(null); setSearch(''); }} activeOpacity={0.7}>
              <Flag cc={c.cc} />
              <View style={{ flex: 1 }}>
                <Text style={s.cityName}>{c.city}</Text>
                <Text style={s.cityCountry}>{c.country}</Text>
              </View>
              <Text style={s.cityCode}>{k.replace('_IN', '')}</Text>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: Colors.hairline }} />}
        />
      </View>
    );
  }

  return (
    <View style={StyleSheet.absoluteFill}>
      <View style={[s.header, { paddingTop: insets.top + 2 }]}>
        <TouchableOpacity style={s.headerBtn} onPress={onBack}><Icon name="close" size={20} color={Colors.text} /></TouchableOpacity>
        <Text style={s.headerTitle}>Add a trip</Text>
        <View style={{ width: 42 }} />
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        {/* Type selector */}
        <View style={s.seg}>
          {(['flight', 'train', 'road'] as TripType[]).map(tp => (
            <TouchableOpacity key={tp} style={[s.segBtn, draft.type === tp && s.segBtnActive]} onPress={() => set('type', tp)} activeOpacity={0.8}>
              <Icon name={tp === 'flight' ? 'plane' : tp === 'train' ? 'train' : 'car'} size={16} color={draft.type === tp ? TypeMeta[tp].color : Colors.text2} fill={tp === 'flight' && draft.type === tp} />
              <Text style={[s.segLabel, draft.type === tp && { color: TypeMeta[tp].color }]}>{TypeMeta[tp].label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* Route picker */}
        <View style={s.routeCard}>
          <TouchableOpacity style={s.routeField} onPress={() => setShowPicker('from')} activeOpacity={0.8}>
            <View style={s.routeIcon}><Icon name="pin" size={18} color={Colors.text2} /></View>
            <View style={{ flex: 1 }}>
              <Text style={s.routeFieldLabel}>From</Text>
              <Text style={draft.from ? s.routeCity : s.routePlaceholder}>{draft.from ? `${CITIES[draft.from].city}, ${CITIES[draft.from].country}` : 'Search a place'}</Text>
            </View>
            <Icon name="chevR" size={18} color={Colors.text3} />
          </TouchableOpacity>
          <View style={s.routeDivider}>
            <TouchableOpacity style={s.swapBtn} onPress={() => setDraft((d: any) => ({ ...d, from: d.to, to: d.from }))}>
              <Icon name="swap" size={17} color={Colors.text} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={s.routeField} onPress={() => setShowPicker('to')} activeOpacity={0.8}>
            <View style={s.routeIcon}><Icon name="pin" size={18} color={Colors.text2} /></View>
            <View style={{ flex: 1 }}>
              <Text style={s.routeFieldLabel}>To</Text>
              <Text style={draft.to ? s.routeCity : s.routePlaceholder}>{draft.to ? `${CITIES[draft.to].city}, ${CITIES[draft.to].country}` : 'Search a place'}</Text>
            </View>
            <Icon name="chevR" size={18} color={Colors.text3} />
          </TouchableOpacity>
        </View>
        <View style={{ gap: 14 }}>
          <View style={s.field}>
            <Text style={s.fieldLabel}>Date</Text>
            <TextInput style={s.input} value={draft.date} onChangeText={v => set('date', v)} placeholder="YYYY-MM-DD" placeholderTextColor={Colors.text3} />
          </View>
          <View style={s.field}>
            <Text style={s.fieldLabel}>{draft.type === 'road' ? 'Vehicle' : 'Carrier'}</Text>
            <TextInput style={s.input} value={draft.carrier} onChangeText={v => set('carrier', v)} placeholder={draft.type === 'flight' ? 'e.g. IndiGo' : draft.type === 'train' ? 'e.g. Rajdhani Express' : 'e.g. Royal Enfield 650'} placeholderTextColor={Colors.text3} />
          </View>
          <View style={s.field}>
            <Text style={s.fieldLabel}>Notes</Text>
            <TextInput style={[s.input, { height: 80, textAlignVertical: 'top' }]} value={draft.note || ''} onChangeText={v => set('note', v)} placeholder="A memory from the road…" placeholderTextColor={Colors.text3} multiline />
          </View>
          {draft.from && draft.to && draft.from !== draft.to && (
            <View style={[s.row, { gap: 8 }]}>
              <Icon name="ruler" size={16} color={TypeMeta[draft.type as TripType].color} />
              <Text style={s.distNote}>Approx {fmt.kmFull(distanceKm(draft.from, draft.to))} km</Text>
            </View>
          )}
        </View>
      </ScrollView>
      <View style={[s.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity style={[s.savePrimary, { opacity: valid ? 1 : 0.45 }]} onPress={valid ? onSave : undefined} activeOpacity={0.85}>
          <Text style={s.savePrimaryText}>Save trip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ---- Success ---- */
function SuccessStep({ trip, onDone, onMap, insets }: any) {
  return (
    <View style={StyleSheet.absoluteFill}>
      <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', opacity: 0.3 }]}>
        <Text style={{ fontSize: 200 }}>🗺</Text>
      </View>
      <View style={[s.successContent, { paddingBottom: insets.bottom + 28 }]}>
        <View style={s.successCheck}><Icon name="check" size={34} color="#06281c" strokeWidth={3} /></View>
        <Text style={s.successTitle}>Added to your atlas</Text>
        <Text style={s.successSub}>{CITIES[trip.from].city} → {CITIES[trip.to].city} · {fmt.kmFull(trip.dist)} km lit up.</Text>
        <View style={[s.row, { gap: 11, marginTop: 22 }]}>
          <TouchableOpacity style={s.btnGhostFull} onPress={onDone} activeOpacity={0.8}><Text style={s.btnGhostText}>Done</Text></TouchableOpacity>
          <TouchableOpacity style={s.btnPrimaryFull} onPress={onMap} activeOpacity={0.85}>
            <Icon name="map" size={18} color="#fff" />
            <Text style={s.savePrimaryText}>See on map</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  // Scanner
  scanHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  scanBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  scanTitle: { fontWeight: '700', fontSize: 15, color: '#fff' },
  scanText: { color: Colors.text2, fontSize: 15 },
  reticleWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  reticle: { width: 236, height: 236, position: 'relative' },
  corner: { position: 'absolute', width: 40, height: 40, borderColor: Colors.accent, borderRadius: 6 },
  scanHint: { position: 'absolute', bottom: -30, fontSize: 13.5, color: 'rgba(255,255,255,0.75)' },
  scanFooter: { padding: 20 },
  demoLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.6, textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: 10 },
  demoRow: { flexDirection: 'row', gap: 10 },
  demoBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: Radii.pill, padding: 14 },
  demoBtnText: { color: '#fff', fontWeight: '600', fontSize: 14.5 },
  manualBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 11, padding: 14 },
  manualBtnText: { color: '#fff', fontWeight: '600', fontSize: 14.5 },
  // Parsing
  parseWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  parseTitle: { fontSize: 22, fontWeight: '700', color: Colors.text, letterSpacing: -0.3, marginBottom: 4 },
  parseSub: { fontSize: 14, color: Colors.text2, marginBottom: 24 },
  parseCard: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.hairline, borderRadius: Radii.lg, paddingHorizontal: 16 },
  parseRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 11 },
  parseKey: { fontSize: 13.5, color: Colors.text2 },
  parseVal: { fontWeight: '700', fontSize: 14 },
  skeleton: { width: 70, height: 13, borderRadius: Radii.sm, backgroundColor: Colors.surface3 },
  // Shared header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12 },
  headerBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.surface2, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontWeight: '700', fontSize: 16, color: Colors.text },
  // Confirm
  bpCard: { borderRadius: Radii.lg, overflow: 'hidden', borderWidth: 1 },
  bpTop: { padding: 18 },
  bpDate: { fontSize: 13, color: Colors.text2 },
  bpIata: { fontSize: 32, fontWeight: '700', color: Colors.text, letterSpacing: -0.5 },
  bpCity: { fontSize: 12.5, color: Colors.text2 },
  bpMeta: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: Colors.hairline },
  bpMetaCell: { flex: 1, padding: 13, borderRightWidth: 1, borderRightColor: Colors.hairline },
  bpMetaLabel: { fontSize: 9.5, fontWeight: '700', letterSpacing: 1.2, color: Colors.text3, marginBottom: 3 },
  bpMetaVal: { fontWeight: '700', fontSize: 13.5, color: Colors.text },
  distCard: { flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: Colors.surface2, borderRadius: Radii.lg, padding: 13, borderWidth: 1, borderColor: Colors.hairline },
  distVal: { fontWeight: '700', color: Colors.text, fontSize: 15 },
  distSub: { fontSize: 12.5, color: Colors.text2 },
  distNote: { fontSize: 13, color: Colors.text2 },
  editBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 14, padding: 14 },
  editBtnText: { color: Colors.accent, fontWeight: '600', fontSize: 15 },
  scannedOk: { fontSize: 13, fontWeight: '600', color: Colors.road },
  // Footer
  footer: { padding: 20, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.hairline },
  savePrimary: { backgroundColor: Colors.accent, borderRadius: Radii.pill, paddingVertical: 17, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, shadowColor: Colors.accent, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 6 },
  savePrimaryText: { color: '#fff', fontWeight: '700', fontSize: 16.5 },
  // Manual form
  seg: { flexDirection: 'row', backgroundColor: Colors.surface2, borderRadius: Radii.pill, padding: 4, marginBottom: 18, gap: 2 },
  segBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 9, borderRadius: Radii.pill },
  segBtnActive: { backgroundColor: Colors.surface },
  segLabel: { fontSize: 13.5, fontWeight: '600', color: Colors.text2 },
  routeCard: { backgroundColor: Colors.surface2, borderRadius: Radii.md, marginBottom: 16, borderWidth: 1, borderColor: Colors.hairline, padding: 6 },
  routeField: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 13 },
  routeIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: Colors.surface3, alignItems: 'center', justifyContent: 'center' },
  routeFieldLabel: { fontSize: 9.5, fontWeight: '700', letterSpacing: 1.2, color: Colors.text3, textTransform: 'uppercase', marginBottom: 2 },
  routeCity: { fontWeight: '700', fontSize: 15.5, color: Colors.text },
  routePlaceholder: { color: Colors.text3, fontSize: 15 },
  routeDivider: { height: 1, backgroundColor: Colors.hairline, marginHorizontal: 14, alignItems: 'flex-end' },
  swapBtn: { position: 'absolute', right: 4, top: -17, width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.surface3, alignItems: 'center', justifyContent: 'center' },
  field: { gap: 7 },
  fieldLabel: { fontSize: 12.5, fontWeight: '600', color: Colors.text2 },
  input: { backgroundColor: Colors.surface2, color: Colors.text, borderWidth: 1.5, borderColor: Colors.hairline, borderRadius: Radii.md, padding: 14, fontSize: 15 },
  // Search
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.surface2, borderRadius: Radii.md, paddingHorizontal: 14, marginBottom: 10 },
  searchInput: { flex: 1, color: Colors.text, padding: 13, fontSize: 15 },
  cityRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, paddingHorizontal: 4 },
  cityName: { fontWeight: '700', fontSize: 15, color: Colors.text },
  cityCountry: { fontSize: 12.5, color: Colors.text2 },
  cityCode: { fontSize: 12.5, color: Colors.text3 },
  // Success
  successContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, alignItems: 'center' },
  successCheck: { width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.road, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  successTitle: { fontSize: 28, fontWeight: '700', color: Colors.text, letterSpacing: -0.5 },
  successSub: { fontSize: 15, color: Colors.text2, marginTop: 6 },
  btnGhostFull: { flex: 1, backgroundColor: Colors.surface2, borderRadius: Radii.pill, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: Colors.hairline2 },
  btnGhostText: { fontWeight: '600', color: Colors.text, fontSize: 15 },
  btnPrimaryFull: { flex: 1, flexDirection: 'row', backgroundColor: Colors.accent, borderRadius: Radii.pill, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', gap: 8 },
});
