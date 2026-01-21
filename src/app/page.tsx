"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { TopBar } from "@/components/TopBar";
import { ScratchMap } from "@/components/ScratchMap";

// Optional: only keep these imports if you installed them.
// If not installed yet, comment them out.
// npm i lucide-react
import { Map as MapIcon, MapPin, Plane, Plus } from "lucide-react";

// Optional: only keep if you installed sonner and created a Toaster.
// npm i sonner
// import { toast } from "sonner";
// import { Toaster } from "@/components/ui/sonner";

/**
 * Minimal shape for local-only country data used by the "Visited" and "Wishlist" tabs.
 * This does NOT replace your Supabase visited_countries table.
 * If you want these panels to reflect Supabase data, we can wire that up next.
 */
type CountryData = {
  code: string; // ISO2 or ISO3 depending on your map
  name: string;
  photos: string[];
  logs: string[];
  visited: boolean;
  wishlist: boolean;
};

export default function HomePage() {
  // Local UI state for wishlist/panels (separate from Supabase-backed ScratchMap for now)
  const [countries, setCountries] = useState<Map<string, CountryData>>(new Map());
  const [activeTab, setActiveTab] = useState<"map" | "visited" | "wishlist">("map");
  const [upcomingTrips, setUpcomingTrips] = useState<Array<{ id: string; country: string; date: string }>>([]);

  const visitedCountries = useMemo(
    () => Array.from(countries.values()).filter((c) => c.visited),
    [countries]
  );

  const wishlistCountries = useMemo(
    () => Array.from(countries.values()).filter((c) => c.wishlist && !c.visited),
    [countries]
  );

  function handleAddTrip() {
    // Placeholder: if you want a dialog, we can add it after you have the dialog component.
    const country = prompt("Country name for trip?");
    if (!country) return;
    const date = prompt("Date (YYYY-MM-DD)?");
    if (!date) return;

    const newTrip = { id: Date.now().toString(), country, date };
    setUpcomingTrips((prev) => [...prev, newTrip]);

    // toast?.success("Trip added!", { description: `${country} on ${new Date(date).toLocaleDateString()}` });
  }

  function handleRemoveFromWishlist(code: string) {
    const existing = countries.get(code);
    if (!existing) return;

    const updated: CountryData = { ...existing, wishlist: false };
    const next = new Map(countries);
    next.set(code, updated);
    setCountries(next);

    // toast?.success(`${existing.name} removed from wishlist`);
  }

  return (
    <div className="min-h-screen bg-white">
      {/* If you have sonner Toaster set up, enable this */}
      {/* <Toaster /> */}

      <TopBar />

      {/* Header with tabs and optional Add Trip button */}
      <header className="border-b bg-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="font-semibold text-lg">Travel Scratch Map</div>
          </div>

          <button
            type="button"
            onClick={handleAddTrip}
            className="inline-flex items-center gap-2 rounded-lg bg-black text-white px-3 py-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Trip
          </button>
        </div>

        <div className="max-w-5xl mx-auto px-4 pb-3">
          <div className="grid w-full max-w-md grid-cols-3 rounded-lg border bg-white p-1 text-sm">
            <TabButton
              active={activeTab === "map"}
              onClick={() => setActiveTab("map")}
              label={`Map`}
              icon={<MapIcon className="w-4 h-4" />}
            />
            <TabButton
              active={activeTab === "visited"}
              onClick={() => setActiveTab("visited")}
              label={`Visited (${visitedCountries.length})`}
              icon={<MapPin className="w-4 h-4" />}
            />
            <TabButton
              active={activeTab === "wishlist"}
              onClick={() => setActiveTab("wishlist")}
              label={`Wishlist (${wishlistCountries.length})`}
              icon={<Plane className="w-4 h-4" />}
            />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {activeTab === "map" && (
          <>
            {/* This preserves ALL functionality from your last file */}
            <section>
              <h1 className="text-2xl font-semibold">Your scratch map</h1>
              <p className="text-sm text-gray-600 mt-1">
                Log in to mark countries as visited and add trips.
              </p>
              <div className="mt-4">
                <ScratchMap />
              </div>
            </section>

            <section className="rounded-xl border bg-white p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Trips</h2>
                <Link href="/trips" className="underline text-sm">
                  View all
                </Link>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Create trips from the Admin page.
              </p>

              {upcomingTrips.length > 0 && (
                <div className="mt-4 space-y-2">
                  {upcomingTrips.map((t) => (
                    <div key={t.id} className="text-sm text-gray-700 flex items-center justify-between">
                      <div>
                        <span className="font-medium">{t.country}</span>
                        <span className="text-gray-500">{"  "}({t.date})</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {activeTab === "visited" && (
          <section className="rounded-xl border bg-white p-5">
            <h2 className="text-lg font-semibold">Visited countries</h2>
            <p className="text-sm text-gray-600 mt-1">
              This panel is currently backed by local state only. Your ScratchMap is backed by Supabase.
              If you want, we can sync this list with Supabase next.
            </p>

            {visitedCountries.length === 0 ? (
              <p className="mt-4 text-sm text-gray-700">No visited countries in this panel yet.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {visitedCountries.map((c) => (
                  <li key={c.code} className="text-sm text-gray-800">
                    {c.name} ({c.code})
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {activeTab === "wishlist" && (
          <section className="rounded-xl border bg-white p-5">
            <h2 className="text-lg font-semibold">Wishlist</h2>
            <p className="text-sm text-gray-600 mt-1">
              This panel is currently backed by local state only. We can wire it to Supabase after your core map flow is stable.
            </p>

            {wishlistCountries.length === 0 ? (
              <p className="mt-4 text-sm text-gray-700">No wishlist countries yet.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {wishlistCountries.map((c) => (
                  <li key={c.code} className="flex items-center justify-between text-sm">
                    <span className="text-gray-800">
                      {c.name} ({c.code})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFromWishlist(c.code)}
                      className="underline text-gray-700"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex items-center justify-center gap-2 rounded-md px-3 py-2",
        active ? "bg-black text-white" : "text-gray-700 hover:bg-gray-50",
      ].join(" ")}
    >
      {icon}
      <span className="truncate">{label}</span>
    </button>
  );
}
