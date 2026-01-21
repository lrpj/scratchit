"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { isAdminUser } from "../../lib/auth";
import Link from "next/link";

export default function AdminPage() {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const session = (await supabase.auth.getSession()).data.session;
      if (!session) return setAllowed(false);
      setAllowed(isAdminUser(session.user.id));
    })();
  }, []);

  if (allowed === null) return <div className="p-6">Loading...</div>;
  if (!allowed)
    return (
      <div className="p-6">
        <p className="text-sm text-gray-700">
          Not authorized. Make sure you are logged in as the admin user.
        </p>
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">Admin</h1>
      <div className="space-x-4">
        <Link className="underline" href="/admin/trips/new">New trip</Link>
        <Link className="underline" href="/admin/photos">Upload photos</Link>
      </div>
    </div>
  );
}
