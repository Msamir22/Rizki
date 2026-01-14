/**
 * Supabase Client for Astik Mobile
 * Initialized with environment variables
 */

import { SupabaseDatabase } from "@astik/db";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Check EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env"
  );
}

export const supabase = createClient<SupabaseDatabase>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

/**
 * Get current authenticated user ID
 * Returns null if not authenticated (guest mode still has an anonymous user)
 */
export async function getCurrentUserId(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/**
 * Check if user is authenticated (including anonymous)
 */
export async function isAuthenticated(): Promise<boolean> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session !== null;
}

/**
 * Sign in anonymously for guest mode
 */
export async function signInAnonymously(): Promise<string | null> {
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) {
    console.error("Anonymous sign-in failed:", error);
    return null;
  }
  return data.user?.id ?? null;
}

/**
 * Ensure user is authenticated (anonymous or real)
 * Retries with exponential backoff, then continues offline if all fail
 *
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @returns true if authenticated, false if failed (app continues offline)
 */
export async function ensureAuthenticated(maxRetries = 3): Promise<boolean> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    // Check if already authenticated
    const hasSession = await isAuthenticated();
    if (hasSession) {
      return true;
    }

    // Attempt anonymous sign-in
    const userId = await signInAnonymously();
    if (userId) {
      return true;
    }

    // Wait before retry with exponential backoff (500ms, 1s, 2s)
    if (attempt < maxRetries - 1) {
      const delay = 500 * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // All attempts failed - continue offline (WatermelonDB works locally)
  console.warn("Authentication failed after retries, continuing offline");
  return false;
}
