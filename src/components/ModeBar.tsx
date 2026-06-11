import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/theme';
import { Stats } from '@/data';

export default function ModeBar({ stats }: { stats: Stats }) {
  const tot = stats.total || 1;
  return (
    <View style={styles.bar}>
      {stats.flight > 0 && <View style={[styles.seg, { flex: stats.flight, backgroundColor: Colors.flight }]} />}
      {stats.train > 0  && <View style={[styles.seg, { flex: stats.train,  backgroundColor: Colors.train  }]} />}
      {stats.road > 0   && <View style={[styles.seg, { flex: stats.road,   backgroundColor: Colors.road   }]} />}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', height: 11, gap: 3 },
  seg: { borderRadius: 99, minWidth: 8 },
});
