"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/` },
    });

    if (error) setStatus(error.message);
    else setStatus("Check your email for a magic link.");
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-semibold">Login</h1>
      <p className="text-sm text-gray-600 mt-1">
        Magic link login via Supabase Auth.
      </p>

      <form onSubmit={signIn} className="mt-4 space-y-3">
        <input
          className="w-full border rounded-lg p-2"
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="w-full rounded-lg bg-black text-white py-2">
          Send magic link
        </button>
      </form>

      {status && <p className="mt-3 text-sm text-gray-700">{status}</p>}
    </div>
  );
}
