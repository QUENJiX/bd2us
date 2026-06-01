import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "@/lib/database.types";
import { hasPublicSupabaseEnv, hasServiceSupabaseEnv } from "@/lib/supabase/env";

export async function getServerSupabase() {
  if (!hasPublicSupabaseEnv()) return null;
  const cookieStore = await cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookieList) {
          try {
            cookieList.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Server Components cannot always write refreshed cookies. Route handlers can.
          }
        }
      }
    }
  );
}

export function getServiceSupabase() {
  if (!hasServiceSupabaseEnv()) return null;
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

export async function getCurrentUser() {
  const supabase = await getServerSupabase();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

export async function getCurrentRole() {
  const user = await getCurrentUser();
  const role = user?.app_metadata?.role;
  return typeof role === "string" ? role : null;
}
