export interface City {
  city: string;
  country: string;
  cc: string;
  ll: [number, number]; // [lat, lon]
}

export const CITIES: Record<string, City> = {
  BOM: { city: 'Mumbai',    country: 'India',           cc: 'IN', ll: [19.09,  72.87]  },
  DEL: { city: 'Delhi',     country: 'India',           cc: 'IN', ll: [28.56,  77.10]  },
  BLR: { city: 'Bengaluru', country: 'India',           cc: 'IN', ll: [13.20,  77.71]  },
  GOI: { city: 'Goa',       country: 'India',           cc: 'IN', ll: [15.38,  73.83]  },
  JAI: { city: 'Jaipur',    country: 'India',           cc: 'IN', ll: [26.82,  75.81]  },
  IXL: { city: 'Leh',       country: 'India',           cc: 'IN', ll: [34.14,  77.55]  },
  MNL_IN: { city: 'Manali', country: 'India',           cc: 'IN', ll: [32.24,  77.19]  },
  AGR: { city: 'Agra',      country: 'India',           cc: 'IN', ll: [27.18,  78.01]  },
  COK: { city: 'Kochi',     country: 'India',           cc: 'IN', ll: [10.15,  76.40]  },
  SIN: { city: 'Singapore', country: 'Singapore',       cc: 'SG', ll: [1.36,  103.99]  },
  DXB: { city: 'Dubai',     country: 'UAE',             cc: 'AE', ll: [25.25,  55.36]  },
  BKK: { city: 'Bangkok',   country: 'Thailand',        cc: 'TH', ll: [13.69, 100.75]  },
  DPS: { city: 'Bali',      country: 'Indonesia',       cc: 'ID', ll: [-8.75, 115.17]  },
  HND: { city: 'Tokyo',     country: 'Japan',           cc: 'JP', ll: [35.55, 139.78]  },
  LHR: { city: 'London',    country: 'United Kingdom',  cc: 'GB', ll: [51.47,  -0.45]  },
  CDG: { city: 'Paris',     country: 'France',          cc: 'FR', ll: [49.01,   2.55]  },
  KTM: { city: 'Kathmandu', country: 'Nepal',           cc: 'NP', ll: [27.70,  85.36]  },
  CMB: { city: 'Colombo',   country: 'Sri Lanka',       cc: 'LK', ll: [7.18,   79.88]  },
  IST: { city: 'Istanbul',  country: 'Turkey',          cc: 'TR', ll: [41.28,  28.75]  },
  JFK: { city: 'New York',  country: 'United States',   cc: 'US', ll: [40.64, -73.78]  },
};

export type TripType = 'flight' | 'train' | 'road';

export interface Trip {
  id: string;
  type: TripType;
  from: string;
  to: string;
  date: string;
  carrier: string;
  code?: string;
  seat: string;
  cls: string;
  dur: number;
  dist: number;
  fav?: boolean;
  note?: string;
}

function distKm(a: string, b: string): number {
  const [la1, lo1] = CITIES[a].ll, [la2, lo2] = CITIES[b].ll;
  const R = 6371, toR = Math.PI / 180;
  const dLa = (la2 - la1) * toR, dLo = (lo2 - lo1) * toR;
  const s = Math.sin(dLa / 2) ** 2 + Math.cos(la1 * toR) * Math.cos(la2 * toR) * Math.sin(dLo / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(s)));
}

let _id = 100;
const trip = (o: Omit<Trip, 'id' | 'dist'>): Trip => ({
  id: 'T' + (_id++),
  dist: distKm(o.from, o.to),
  ...o,
});

export const DEFAULT_TRIPS: Trip[] = [
  trip({ type:'flight', from:'BOM', to:'SIN', date:'2026-05-12', carrier:'Singapore Airlines', code:'SQ423', seat:'14A', cls:'Economy', dur:330, fav:true, note:'Window seat over the Andaman Sea. Cleared immigration in 9 minutes.' }),
  trip({ type:'road',   from:'DEL', to:'IXL', date:'2026-04-02', carrier:'Royal Enfield 650', seat:'—', cls:'Self-drive', dur:1320, fav:true, note:'Five days, three passes, one flat tyre above 17,000 ft.' }),
  trip({ type:'flight', from:'DEL', to:'DXB', date:'2026-03-18', carrier:'Emirates', code:'EK513', seat:'22F', cls:'Business', dur:200 }),
  trip({ type:'train',  from:'BOM', to:'DEL', date:'2026-02-21', carrier:'Rajdhani Express', code:'12951', seat:'B2-31', cls:'AC 2-Tier', dur:945, note:'Overnight Rajdhani. Tomato soup at 9pm, fields of mustard at dawn.' }),
  trip({ type:'flight', from:'BOM', to:'HND', date:'2026-01-09', carrier:'ANA', code:'NH830', seat:'31K', cls:'Economy', dur:540, fav:true }),
  trip({ type:'flight', from:'DEL', to:'KTM', date:'2025-12-15', carrier:'IndiGo', code:'6E1991', seat:'7C', cls:'Economy', dur:95 }),
  trip({ type:'road',   from:'DEL', to:'AGR', date:'2025-11-30', carrier:'Tata Nexon', seat:'—', cls:'Self-drive', dur:210 }),
  trip({ type:'flight', from:'BOM', to:'LHR', date:'2025-10-22', carrier:'British Airways', code:'BA138', seat:'40A', cls:'Economy', dur:585, fav:true }),
  trip({ type:'flight', from:'LHR', to:'CDG', date:'2025-10-25', carrier:'Air France', code:'AF1681', seat:'11D', cls:'Economy', dur:80 }),
  trip({ type:'train',  from:'DEL', to:'JAI', date:'2025-09-14', carrier:'Shatabdi Express', code:'12015', seat:'C4-18', cls:'AC Chair', dur:270 }),
  trip({ type:'flight', from:'BOM', to:'DPS', date:'2025-08-03', carrier:'Garuda Indonesia', code:'GA8851', seat:'19A', cls:'Economy', dur:380 }),
  trip({ type:'flight', from:'BLR', to:'BKK', date:'2025-06-19', carrier:'Thai Airways', code:'TG326', seat:'27C', cls:'Economy', dur:255 }),
  trip({ type:'flight', from:'BOM', to:'GOI', date:'2025-05-02', carrier:'Vistara', code:'UK843', seat:'9F', cls:'Premium Eco', dur:75 }),
  trip({ type:'road',   from:'DEL', to:'MNL_IN', date:'2025-04-11', carrier:'Mahindra Thar', seat:'—', cls:'Self-drive', dur:660 }),
  trip({ type:'flight', from:'BOM', to:'CMB', date:'2025-02-27', carrier:'SriLankan', code:'UL142', seat:'16A', cls:'Economy', dur:110 }),
  trip({ type:'flight', from:'DEL', to:'IST', date:'2024-12-08', carrier:'Turkish Airlines', code:'TK717', seat:'33K', cls:'Economy', dur:430 }),
  trip({ type:'flight', from:'IST', to:'JFK', date:'2024-12-09', carrier:'Turkish Airlines', code:'TK3', seat:'52A', cls:'Economy', dur:650, fav:true }),
  trip({ type:'train',  from:'BOM', to:'COK', date:'2024-10-19', carrier:'Netravati Express', code:'16345', seat:'A1-7', cls:'AC 1st', dur:1500 }),
];

export interface Stats {
  total: number;
  dist: number;
  flight: number;
  train: number;
  road: number;
  countries: number;
  cities: number;
  longest: Trip | null;
  mostCountry: string;
  mostCountryCount: number;
}

export function computeStats(trips: Trip[]): Stats {
  const s = { total: trips.length, dist: 0, flight: 0, train: 0, road: 0,
    countries: new Set<string>(), cities: new Set<string>(), longest: null as Trip | null,
    byCountry: {} as Record<string, number> };
  trips.forEach(t => {
    s.dist += t.dist; (s as any)[t.type]++;
    [t.from, t.to].forEach(c => {
      s.cities.add(c);
      const cc = CITIES[c].country;
      s.countries.add(cc);
      s.byCountry[cc] = (s.byCountry[cc] || 0) + 1;
    });
    if (!s.longest || t.dist > s.longest.dist) s.longest = t;
  });
  const mostCountry = Object.entries(s.byCountry).sort((a, b) => b[1] - a[1])[0];
  return {
    total: s.total, dist: s.dist, flight: s.flight, train: s.train, road: s.road,
    countries: s.countries.size, cities: s.cities.size, longest: s.longest,
    mostCountry: mostCountry ? mostCountry[0] : '—',
    mostCountryCount: mostCountry ? mostCountry[1] : 0,
  };
}

export const PROFILE = {
  name: 'Aanya Rao',
  handle: '@aanyaonthemove',
  home: 'Mumbai, India',
  since: 'Joined 2024',
  streakWeeks: 7,
  bio: 'Window seat enthusiast. Collecting horizons one boarding pass at a time.',
};

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold';
  need: number;
  metric: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id:'first',     name:'First Steps',      desc:'Log your first journey',       icon:'flag',    tier:'bronze', need:1,     metric:'total'       },
  { id:'globe10',   name:'Globetrotter',     desc:'Visit 10 countries',           icon:'globe',   tier:'gold',   need:10,    metric:'countries'   },
  { id:'haul',      name:'Long Hauler',      desc:'A single trip over 6,000 km',  icon:'plane',   tier:'silver', need:6000,  metric:'longestDist' },
  { id:'rails',     name:'Rail Rider',       desc:'Take 5 train journeys',        icon:'train',   tier:'silver', need:5,     metric:'train'       },
  { id:'orbit',     name:'Around the World', desc:'Travel 40,000 km total',       icon:'compass', tier:'gold',   need:40000, metric:'dist'        },
  { id:'streak',    name:'On a Streak',      desc:'Travel 6 weeks running',       icon:'flame',   tier:'bronze', need:6,     metric:'streakWeeks' },
  { id:'roadtrip',  name:'Open Road',        desc:'Complete 3 road trips',        icon:'car',     tier:'bronze', need:3,     metric:'road'        },
  { id:'continents',name:'Continental',      desc:'Land on 4 continents',         icon:'layers',  tier:'gold',   need:4,     metric:'continents'  },
];

export const TypeMeta: Record<TripType, { label: string; color: string; soft: string; verb: string }> = {
  flight: { label: 'Flight', color: '#FF6B57', soft: 'rgba(255,107,87,0.16)', verb: 'Flew'  },
  train:  { label: 'Train',  color: '#4D9DFF', soft: 'rgba(77,157,255,0.16)', verb: 'Rode'  },
  road:   { label: 'Road',   color: '#35D6A0', soft: 'rgba(53,214,160,0.16)', verb: 'Drove' },
};

export const SAMPLE_DOCS: Record<string, Omit<Trip, 'id' | 'dist'>> = {
  flight: { type:'flight', from:'BOM', to:'SIN', date:'2026-05-29', carrier:'Singapore Airlines', code:'SQ423', seat:'14A', cls:'Economy', dur:330 },
  train:  { type:'train',  from:'BOM', to:'DEL', date:'2026-05-29', carrier:'Rajdhani Express',   code:'12951', seat:'B2-31', cls:'AC 2-Tier', dur:945 },
};
