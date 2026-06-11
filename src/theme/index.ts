export const Colors = {
  bg: '#090B11',
  bg2: '#0C0F17',
  surface: '#13161F',
  surface2: '#1A1E29',
  surface3: '#232836',
  hairline: 'rgba(255,255,255,0.07)',
  hairline2: 'rgba(255,255,255,0.12)',

  text: '#F3F5FA',
  text2: '#A7AEBF',
  text3: '#6C7385',

  flight: '#FF6B57',
  train: '#4D9DFF',
  road: '#35D6A0',
  flightSoft: 'rgba(255,107,87,0.16)',
  trainSoft: 'rgba(77,157,255,0.16)',
  roadSoft: 'rgba(53,214,160,0.16)',

  gold: '#F3C46B',
  accent: '#FF6B57',

  mapBg: '#0A0D15',
  mapLand: '#1A2030',
  mapLand2: '#222B40',
};

export const Radii = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 22,
  xl: 30,
  pill: 999,
};

export const Typography = {
  display: { fontWeight: '700' as const, letterSpacing: -0.4 },
  body: { fontSize: 15, lineHeight: 22 },
  eyebrow: { fontSize: 11, fontWeight: '700' as const, letterSpacing: 1.8, textTransform: 'uppercase' as const, color: Colors.text3 },
};

export const Shadows = {
  sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  md: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 8 },
  lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.5, shadowRadius: 40, elevation: 16 },
};

export const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0A0D15' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#A7AEBF' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0A0D15' }] },
  { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: 'rgba(120,140,180,0.28)' }] },
  { featureType: 'administrative.country', elementType: 'labels.text.fill', stylers: [{ color: '#A7AEBF' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#1A2030' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#1A2030' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#232836' }] },
  { featureType: 'road', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0A0D15' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4D6170' }] },
];
