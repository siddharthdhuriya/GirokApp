import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

const PATHS: Record<string, string> = {
  map:      'M9 4L3 6.5v13.5l6-2.5 6 2.5 6-2.5V3.5l-6 2.5L9 4zM9 4v13.5M15 6.5V20',
  scan:     'M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16M4 12h16',
  plus:     'M12 5v14M5 12h14',
  list:     'M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01',
  user:     'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM5 20c0-3.3 3.1-6 7-6s7 2.7 7 6',
  plane:    'M21 16.5L13.5 12V5a1.5 1.5 0 0 0-3 0v7L3 16.5V18l7.5-2v3.5L8.5 21v1l3.5-1 3.5 1v-1l-2-1.5V16l7.5 2v-1.5z',
  train:    'M8 4h8a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3zM5 11h14M9 17l-2.5 3M15 17l2.5 3M9.5 14h.01M14.5 14h.01',
  car:      'M5 16v2.5M19 16v2.5M4 16l1.2-4.2A3 3 0 0 1 8.1 9.6h7.8a3 3 0 0 1 2.9 2.2L20 16M4 16h16v-2.2a1.8 1.8 0 0 0-1.8-1.8H5.8A1.8 1.8 0 0 0 4 13.8V16zM7 13h.01M17 13h.01',
  arrowRight:'M5 12h14M13 6l6 6-6 6',
  arrowLeft: 'M19 12H5M11 18l-6-6 6-6',
  chevR:    'M9 6l6 6-6 6',
  chevL:    'M15 6l-6 6 6 6',
  chevD:    'M6 9l6 6 6-6',
  chevUp:   'M6 15l6-6 6 6',
  search:   'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',
  share:    'M12 3v13M12 3L8 7M12 3l4 4M5 12v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6',
  close:    'M6 6l12 12M18 6L6 18',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  pin:      'M12 21s-7-6.4-7-11a7 7 0 0 1 14 0c0 4.6-7 11-7 11zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  globe:    'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c2.6 2.6 4 5.7 4 9s-1.4 6.4-4 9c-2.6-2.6-4-5.7-4-9s1.4-6.4 4-9z',
  clock:    'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  flag:     'M5 21V4M5 4c3-1.5 6 1.5 9 0s5 0 5 0v9s-2 1.5-5 0-6 1.5-9 0',
  ruler:    'M4 16.5L16.5 4l3.5 3.5L7.5 20 4 16.5zM8 8.5l1.5 1.5M11 5.5l1.5 1.5M5.5 11l1.5 1.5',
  edit:     'M5 19h14M7 15l9.5-9.5a1.8 1.8 0 0 0-2.5-2.5L4.5 12.5 4 16l3.5-.5z',
  trash:    'M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13M10 11v6M14 11v6',
  flame:    'M12 21c3.9 0 6.5-2.5 6.5-6 0-1.8-.7-3.4-1.8-4.7-.5 1-1.4 1.6-2.2 1.6 1-2.6-.2-5.4-2.8-7.4.2 2.4-1 3.8-2.4 5.2C7.6 11.2 6 13 6 15.5 6 18.7 8.4 21 12 21z',
  check:    'M5 12.5l4.5 4.5L19 7',
  checkCircle:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8 12l2.5 2.5L16 9',
  bell:     'M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6M10 20a2 2 0 0 0 4 0',
  heart:    'M12 20s-7-4.6-9.2-9C1.5 8.4 2.6 5.3 5.4 4.6 7.3 4.1 9 5 12 8c3-3 4.7-3.9 6.6-3.4 2.8.7 3.9 3.8 2.6 6.4C19 15.4 12 20 12 20z',
  compass:  'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM15.5 8.5l-2 5-5 2 2-5 5-2z',
  layers:   'M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 17l9 5 9-5',
  download: 'M12 4v11M12 15l-4-4M12 15l4-4M5 19h14',
  mail:     'M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zM4 7l8 6 8-6',
  lock:     'M7 11V8a5 5 0 0 1 10 0v3M5 11h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1zM12 15v3',
  seat:     'M6 4v8h8M6 12l-1 6M14 12l3 6M6 12a3 3 0 0 0 3 3h5',
  sparkle:  'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z',
  star:     'M12 3.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L12 17l-5.3 2.8 1-5.8L3.5 9.7l5.9-.9L12 3.5z',
  swap:     'M7 4v13M7 4L4 7M7 4l3 3M17 20V7M17 20l3-3M17 20l-3-3',
  bolt:     'M13 2L4 14h7l-1 8 9-12h-7l1-8z',
  image:    'M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z',
  camera:   'M4 8a2 2 0 0 1 2-2h1.5l1-2h7l1 2H18a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z',
};

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
  fill?: boolean;
  style?: object;
}

export default function Icon({ name, size = 22, color = 'currentColor', strokeWidth = 2, fill = false, style }: IconProps) {
  const d = PATHS[name];
  if (!d) return null;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d={d}
        stroke={fill ? 'none' : color}
        fill={fill ? color : 'none'}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
