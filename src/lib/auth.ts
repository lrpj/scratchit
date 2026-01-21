import { supabase } from "./supabaseClient";

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export function isAdminUser(userId?: string | null) {
  const adminId = process.env.NEXT_PUBLIC_ADMIN_USER_ID;
  if (!adminId) return true; // fallback for early dev
  return !!userId && userId === adminId;
}

