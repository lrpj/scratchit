"use client";

import { useEffect, useState } from "react";
import { fetchTrips, Trip } from "@/lib/db";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetchTrips()
      .then(setTrips)
      .catch((e) => setErr(e?.message ?? "Failed to load trips"));
  }, []);

  return (
    <div>
      <TopBar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold">Trips</h1>
        {err && <p className="mt-3 text-sm text-gray-700">{err}</p>}

        <ul className="mt-4 space-y-3">
          {trips.map((t) => (
            <li key={t.id} className="rounded-xl border bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{t.title}</div>
                  <div className="text-sm text-gray-600">
                    {t.start_date ?? "?"} to {t.end_date ?? "?"}
                  </div>
                </div>
                <Link className="underline text-sm" href={`/trips/${t.id}`}>
                  Open
                </Link>
              </div>
              {t.summary && <p className="mt-2 text-sm text-gray-700">{t.summary}</p>}
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
