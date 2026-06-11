# Girok — Android App

React Native + Expo conversion of the Girok travel-logging prototype.

## Project layout

```
src/
  theme/index.ts          Colors, radii, map style, shadows
  data/index.ts           Cities, trips, stats, achievements, TypeMeta
  utils/fmt.ts            Formatting helpers (km, date, time)
  utils/geo.ts            distanceKm, greatCircleCoords, routeRegion
  context/AppContext.tsx  Global state (trips, stats, auth)
  components/
    Icon.tsx              All SVG icons via react-native-svg
    Avatar.tsx            Gradient avatar
    TripRow.tsx           Home & search trip row
    StatTile.tsx          2×2 stat grid tile
    ModeBar.tsx           Flight/train/road proportion bar
    Badge.tsx             Achievement badge (locked/unlocked)
    TypeTag.tsx           Flight / Train / Road pill tag
    Flag.tsx              Country code chip

app/
  _layout.tsx             Root: providers, status bar
  index.tsx               Splash → Welcome or Tabs
  welcome.tsx             Welcome + auth sheet
  (tabs)/
    _layout.tsx           Custom 5-tab bar with scan FAB
    index.tsx             Home dashboard
    map.tsx               Interactive world map (react-native-maps)
    trips.tsx             Trip timeline (SectionList)
    profile.tsx           Profile, stats, badges, milestones
  add.tsx                 Scan → Parse → Confirm → Manual → Success
  trip/[id].tsx           Full trip detail with map
```

## Prerequisites

1. **Android Studio** with Android SDK 33+ and an emulator/device
2. **Google Maps API key** — get one at https://console.cloud.google.com
   - Enable **Maps SDK for Android**
   - Add the key to `app.json` → `android.config.googleMaps.apiKey`
   - Also add to the `react-native-maps` plugin entry

## Run on device / emulator

```bash
cd GirokApp

# First time: build the native Android project
npx expo run:android

# Subsequent runs (JS-only changes): just start Metro
npm run android
```

## Build a release APK

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Configure build profiles (first time)
eas build:configure

# Build APK for local testing
eas build --platform android --profile preview

# Build AAB for Play Store
eas build --platform android --profile production
```

## Real QR scanning

The `add.tsx` scanner uses `expo-camera` with `onBarcodeScanned`.
Airline boarding passes use the **BCBP (IATA Bar Coded Boarding Pass)** format (PDF417 or Aztec).
To parse them, install a BCBP parser:

```bash
npm install bcbp
```

Then replace the `handleScan` stub in `app/add.tsx`:

```typescript
import { parse } from 'bcbp';

function handleScan({ data }: { data: string }) {
  if (scanned) return;
  setScanned(true);
  try {
    const bp = parse(data);
    const leg = bp.legs[0];
    setDraft({
      type: 'flight',
      from: leg.originAirport,
      to: leg.destinationAirport,
      date: /* format leg.dateOfFlight */,
      carrier: leg.operatingCarrierDesignator,
      code: leg.flightNumber,
      seat: leg.seatNumber,
      cls: 'Economy',
      dur: 0,
    });
    setStep('confirm');
  } catch {
    Alert.alert('Could not read pass', 'Try entering the trip manually.');
    setStep('manual');
  }
}
```

## Fonts (optional)

To match the prototype fonts exactly, install:

```bash
npx expo install @expo-google-fonts/bricolage-grotesque @expo-google-fonts/hanken-grotesk
```

Then load them in `app/_layout.tsx`:

```typescript
import { useFonts, BricolageGrotesque_700Bold } from '@expo-google-fonts/bricolage-grotesque';
import { HankenGrotesk_400Regular, HankenGrotesk_600SemiBold } from '@expo-google-fonts/hanken-grotesk';

// in _layout:
const [fontsLoaded] = useFonts({ BricolageGrotesque_700Bold, HankenGrotesk_400Regular, HankenGrotesk_600SemiBold });
if (!fontsLoaded) return null;
```

And reference them in `src/theme/index.ts` typography.
