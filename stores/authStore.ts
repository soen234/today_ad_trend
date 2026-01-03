import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Session, User, AuthError } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  initialize: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  deleteAccount: () => Promise<{ error: Error | null }>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  isInitialized: false,

  initialize: async () => {
    // Skip if Supabase is not configured
    if (!isSupabaseConfigured) {
      console.warn('Supabase not configured, skipping auth initialization');
      set({ isLoading: false, isInitialized: true });
      return;
    }

    try {
      // Get initial session
      const {
        data: { session },
      } = await supabase.auth.getSession();
      set({
        session,
        user: session?.user ?? null,
        isLoading: false,
        isInitialized: true,
      });

      // Listen for auth changes
      supabase.auth.onAuthStateChange((_event, session) => {
        set({ session, user: session?.user ?? null });
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ isLoading: false, isInitialized: true });
    }
  },

  signUp: async (email, password) => {
    if (!isSupabaseConfigured) {
      return { error: { message: 'Authentication not available' } as AuthError };
    }
    set({ isLoading: true });
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    set({ isLoading: false });
    return { error };
  },

  signIn: async (email, password) => {
    if (!isSupabaseConfigured) {
      return { error: { message: 'Authentication not available' } as AuthError };
    }
    set({ isLoading: true });
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    set({ isLoading: false });
    return { error };
  },

  signOut: async () => {
    if (!isSupabaseConfigured) {
      set({ user: null, session: null, isLoading: false });
      return;
    }
    set({ isLoading: true });
    await supabase.auth.signOut();
    set({ user: null, session: null, isLoading: false });
  },

  resetPassword: async (email) => {
    if (!isSupabaseConfigured) {
      return { error: { message: 'Authentication not available' } as AuthError };
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error };
  },

  deleteAccount: async () => {
    if (!isSupabaseConfigured) {
      return { error: new Error('Authentication not available') };
    }

    const { user } = get();
    if (!user) {
      return { error: new Error('No user logged in') };
    }

    set({ isLoading: true });

    try {
      // Call the Supabase RPC function to delete the account
      const { error } = await supabase.rpc('delete_user_account');

      if (error) {
        set({ isLoading: false });
        return { error: new Error(error.message) };
      }

      // Clear local state after successful deletion
      set({ user: null, session: null, isLoading: false });
      return { error: null };
    } catch (err) {
      set({ isLoading: false });
      return { error: err instanceof Error ? err : new Error('Failed to delete account') };
    }
  },
}));
