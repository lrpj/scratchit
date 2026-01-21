"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { isAdminUser } from "../lib/auth";

export function TopBar() {
  const [email, setEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const session = (await supabase.auth.getSession()).data.session;
      if (!mounted) return;
      setEmail(session?.user?.email ?? null);
      setIsAdmin(isAdminUser(session?.user?.id));
    }

    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function logout() {
    await supabase.auth.signOut();
  }

  return (
    <div className="w-full border-b bg-white">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold">
          Scratch Travelbook
        </Link>

        <div className="flex items-center gap-3 text-sm">
          {email ? (
            <>
              {isAdmin && <Link href="/admin" className="underline">Admin</Link>}
              <span className="text-gray-600">{email}</span>
              <button onClick={logout} className="underline">
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="underline">
              Login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
