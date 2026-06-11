import React from 'react';
import { Tabs, router } from 'expo-router';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BottomTabBarProps = any;
import Icon from '@/components/Icon';
import { Colors, Radii } from '@/theme';

const TABS = [
  { name: 'index',   label: 'Home',  icon: 'compass' },
  { name: 'map',     label: 'Map',   icon: 'map'     },
  { name: 'trips',   label: 'Trips', icon: 'list'    },
  { name: 'profile', label: 'You',   icon: 'user'    },
];

function GirokTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.bar}>
      {/* left two tabs */}
      {[0, 1].map(i => {
        const route = state.routes[i];
        const active = state.index === i;
        const tab = TABS[i];
        return (
          <TouchableOpacity key={route.key} style={styles.tab} onPress={() => navigation.navigate(route.name)} activeOpacity={0.7}>
            {active && <View style={styles.dot} />}
            <Icon name={tab.icon} size={24} color={active ? Colors.text : Colors.text3} fill={tab.icon === 'user' && active} />
            <Text style={[styles.label, active && styles.labelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}

      {/* center scan FAB */}
      <View style={styles.fabWrap}>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/add')}
          activeOpacity={0.85}
        >
          <Icon name="scan" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.fabLabel}>Scan</Text>
      </View>

      {/* right two tabs */}
      {[2, 3].map(i => {
        const route = state.routes[i];
        const active = state.index === i;
        const tab = TABS[i];
        return (
          <TouchableOpacity key={route.key} style={styles.tab} onPress={() => navigation.navigate(route.name)} activeOpacity={0.7}>
            {active && <View style={styles.dot} />}
            <Icon name={tab.icon} size={24} color={active ? Colors.text : Colors.text3} fill={tab.icon === 'user' && active} />
            <Text style={[styles.label, active && styles.labelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs tabBar={(props) => <GirokTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index"   options={{ title: 'Home'    }} />
      <Tabs.Screen name="map"     options={{ title: 'Map'     }} />
      <Tabs.Screen name="trips"   options={{ title: 'Trips'   }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    paddingTop: 9,
    paddingBottom: Platform.OS === 'android' ? 12 : 22,
    backgroundColor: Colors.bg,
    borderTopWidth: 1,
    borderTopColor: Colors.hairline,
  },
  tab: {
    flex: 1, alignItems: 'center', gap: 4,
    paddingVertical: 6, position: 'relative',
  },
  dot: {
    position: 'absolute', top: -1,
    width: 5, height: 5, borderRadius: 999,
    backgroundColor: Colors.accent,
  },
  label: { fontSize: 10.5, fontWeight: '600', color: Colors.text3, letterSpacing: 0.1 },
  labelActive: { color: Colors.text },
  fabWrap: { alignItems: 'center', gap: 4, paddingBottom: 2 },
  fab: {
    width: 56, height: 56, borderRadius: 20,
    backgroundColor: Colors.accent,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: -12,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  fabLabel: { fontSize: 10.5, fontWeight: '600', color: Colors.text3 },
});
