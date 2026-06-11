import { CITIES } from '@/data';

export function distanceKm(a: string, b: string): number {
  const [la1, lo1] = CITIES[a].ll, [la2, lo2] = CITIES[b].ll;
  const R = 6371, toR = Math.PI / 180;
  const dLa = (la2 - la1) * toR, dLo = (lo2 - lo1) * toR;
  const s = Math.sin(dLa / 2) ** 2 + Math.cos(la1 * toR) * Math.cos(la2 * toR) * Math.sin(dLo / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(s)));
}

export function greatCircleCoords(
  fromKey: string,
  toKey: string,
  n = 60
): Array<{ latitude: number; longitude: number }> {
  const toR = Math.PI / 180, toD = 180 / Math.PI;
  const [la1, lo1] = CITIES[fromKey].ll.map((x: number) => x * toR);
  const [la2, lo2] = CITIES[toKey].ll.map((x: number) => x * toR);
  const d = 2 * Math.asin(Math.sqrt(
    Math.sin((la2 - la1) / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin((lo2 - lo1) / 2) ** 2
  ));
  if (d === 0) return [{ latitude: CITIES[fromKey].ll[0], longitude: CITIES[fromKey].ll[1] }];
  const pts: Array<{ latitude: number; longitude: number }> = [];
  for (let i = 0; i <= n; i++) {
    const f = i / n;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);
    const x = A * Math.cos(la1) * Math.cos(lo1) + B * Math.cos(la2) * Math.cos(lo2);
    const y = A * Math.cos(la1) * Math.sin(lo1) + B * Math.cos(la2) * Math.sin(lo2);
    const z = A * Math.sin(la1) + B * Math.sin(la2);
    pts.push({
      latitude: Math.atan2(z, Math.sqrt(x * x + y * y)) * toD,
      longitude: Math.atan2(y, x) * toD,
    });
  }
  return pts;
}

export function routeRegion(fromKey: string, toKey: string) {
  const [la1, lo1] = CITIES[fromKey].ll;
  const [la2, lo2] = CITIES[toKey].ll;
  const midLat = (la1 + la2) / 2;
  const midLon = (lo1 + lo2) / 2;
  const latDelta = Math.abs(la2 - la1) * 1.8 + 10;
  const lonDelta = Math.abs(lo2 - lo1) * 1.8 + 10;
  return { latitude: midLat, longitude: midLon, latitudeDelta: latDelta, longitudeDelta: lonDelta };
}
