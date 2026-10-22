import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { computeStats, Trip, Stats } from '@/data';
import { distanceKm } from '@/utils/geo';

// ── DB row shape (from = reserved word in SQL, so we use from_key/to_key) ──
interface TripRow {
  id: string;
  user_id: string;
  type: 'flight' | 'train' | 'road';
  from_key: string;
  to_key: string;
  date: string;
  carrier: string;
  code: string;
  seat: string;
  cls: string;
  dist: number;
  dur: number;
  note: string;
  fav: boolean;
}

function rowToTrip(r: TripRow): Trip {
  return {
    id: r.id, type: r.type, from: r.from_key, to: r.to_key,
    date: r.date, carrier: r.carrier ?? '', code: r.code ?? '',
    seat: r.seat ?? '', cls: r.cls ?? '', dist: r.dist ?? 0, dur: r.dur ?? 0,
    note: r.note ?? '', fav: r.fav ?? false,
  };
}

function tripToRow(t: Trip, userId: string): Omit<TripRow, 'id'> {
  return {
    user_id: userId, type: t.type, from_key: t.from, to_key: t.to,
    date: t.date, carrier: t.carrier, code: t.code ?? '',
    seat: t.seat, cls: t.cls, dist: t.dist, dur: t.dur,
    note: t.note ?? '', fav: t.fav ?? false,
  };
}

// ── Context type ─────────────────────────────────────────────────────────────
interface AppContextValue {
  trips: Trip[];
  stats: Stats;
  loading: boolean;
  user: User | null;
  addTrip: (trip: Trip) => Promise<void>;
  updateTrip: (trip: Trip) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string, name?: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<string | null>;
  updateName: (name: string) => Promise<string | null>;
  displayName: string;
  // kept for backward compat with existing screens
  isAuthenticated: boolean;
  setAuthenticated: (v: boolean) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  // Load trips for a given user from Supabase
  async function loadTrips(userId: string) {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    if (!error && data) {
      setTrips((data as TripRow[]).map(rowToTrip));
    }
    setLoading(false);
  }

  // On mount: restore session, then listen for auth changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) loadTrips(u.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        loadTrips(u.id);
      } else {
        setTrips([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const stats = useMemo(() => computeStats(trips), [trips]);

  const displayName = useMemo(() => {
    if (!user) return 'Traveller';
    const n = user.user_metadata?.full_name as string | undefined;
    if (n) return n;
    const prefix = user.email?.split('@')[0] ?? '';
    return prefix.replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Traveller';
  }, [user]);

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const addTrip = useCallback(async (trip: Trip) => {
    if (!user) return;
    // Let DB generate the UUID; ignore the client-side id
    const { data, error } = await supabase
      .from('trips')
      .insert(tripToRow(trip, user.id))
      .select()
      .single();
    if (!error && data) {
      const saved = rowToTrip(data as TripRow);
      setTrips(ts => [saved, ...ts].sort((a, b) => b.date.localeCompare(a.date)));
    }
  }, [user]);

  const updateTrip = useCallback(async (trip: Trip) => {
    if (!user) return;
    const updated: Trip = { ...trip, dist: distanceKm(trip.from, trip.to) };
    const { error } = await supabase
      .from('trips')
      .update(tripToRow(updated, user.id))
      .eq('id', trip.id);
    if (!error) {
      setTrips(ts => ts.map(x => x.id === trip.id ? updated : x).sort((a, b) => b.date.localeCompare(a.date)));
    }
  }, [user]);

  const deleteTrip = useCallback(async (id: string) => {
    const { error } = await supabase.from('trips').delete().eq('id', id);
    if (!error) setTrips(ts => ts.filter(x => x.id !== id));
  }, []);

  // ── Auth ──────────────────────────────────────────────────────────────────
  const signIn = useCallback(async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error?.message ?? null;
  }, []);

  const signUp = useCallback(async (email: string, password: string, name?: string): Promise<string | null> => {
    const { error } = await supabase.auth.signUp({
      email, password,
      options: name ? { data: { full_name: name } } : undefined,
    });
    return error?.message ?? null;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<string | null> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return error?.message ?? null;
  }, []);

  const updateName = useCallback(async (name: string): Promise<string | null> => {
    const { data, error } = await supabase.auth.updateUser({ data: { full_name: name } });
    if (!error && data.user) setUser(data.user);
    return error?.message ?? null;
  }, []);

  return (
    <AppContext.Provider value={{
      trips, stats, loading, user, displayName,
      addTrip, updateTrip, deleteTrip,
      signIn, signUp, signOut, resetPassword, updateName,
      isAuthenticated: user !== null,
      setAuthenticated: () => {},
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
