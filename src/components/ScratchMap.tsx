"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchVisitedCountries, toggleVisitedCountry } from "@/lib/db";
import { supabase } from "@/lib/supabaseClient";
import { isAdminUser } from "@/lib/auth";

type Visited = { code: string };

export function ScratchMap() {
  const [visited, setVisited] = useState<Visited[]>([]);
  const [loading, setLoading] = useState(true);
  const [canEdit, setCanEdit] = useState(false);

  const visitedSet = useMemo(() => new Set(visited.map((v) => v.code)), [visited]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);

      const session = (await supabase.auth.getSession()).data.session;
      setCanEdit(isAdminUser(session?.user?.id));

      if (session) {
        const rows = await fetchVisitedCountries();
        if (mounted) setVisited(rows.map((r) => ({ code: r.code })));
      } else {
        if (mounted) setVisited([]);
      }

      if (mounted) setLoading(false);
    }

    load();

    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

async function onCountryClick(code: string) {
  if (!canEdit) return;

  const isVisited = visitedSet.has(code);

  // optimistic UI update
  setVisited((prev) =>
    isVisited ? prev.filter((x) => x.code !== code) : [...prev, { code }]
  );

  try {
    await toggleVisitedCountry(code, !isVisited);
  } catch (e) {
    console.error(e);
    alert("Could not update visited countries. Check that you are logged in.");

    // reload from DB to recover correct state
    const rows = await fetchVisitedCountries();
    setVisited(rows.map((r: any) => ({ code: r.code })));
  }
}


  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-gray-600">
          {loading ? "Loading..." : `Visited: ${visitedSet.size}`}
        </div>
        <div className="text-sm text-gray-600">
          {canEdit ? "Edit enabled" : "View only"}
        </div>
      </div>

      <WorldSvg visitedSet={visitedSet} onCountryClick={onCountryClick} />
      <p className="mt-3 text-xs text-gray-500">
        Tip: country paths must have id=ISO3 (example: NOR, SWE, USA).
      </p>
    </div>
  );
}

function WorldSvg({
  visitedSet,
  onCountryClick,
}: {
  visitedSet: Set<string>;
  onCountryClick: (code: string) => void;
}) {
  const [svgText, setSvgText] = useState<string>("");

  useEffect(() => {
    fetch("/world.svg")
      .then((r) => r.text())
      .then(setSvgText)
      .catch(() => setSvgText(""));
  }, []);

  if (!svgText) return <div className="text-sm text-gray-600">Map asset missing.</div>;

  // Style whole country groups based on <g id="XX"> where XX is ISO2.
  // This SVG uses uppercase <g id="AM"> etc. We attach data-iso2 and a style.
  const enhanced = svgText
    .replace(/<svg\b([^>]*)>/i, `<svg $1 class="w-full h-auto select-none">`)
    .replace(/<g id="([A-Z]{2})"\b([^>]*)>/g, (_m, iso2, rest) => {
      const isVisited = visitedSet.has(iso2);
      const style = [
        "cursor:pointer",
        "transition:opacity 120ms ease",
        // “scratch” effect: visited darker, unvisited lighter
        isVisited ? "opacity:1" : "opacity:0.35",
      ].join(";");

      // Add a data attribute so we can detect clicks even if inner paths are clicked
      return `<g id="${iso2}" data-iso2="${iso2}" ${rest} style="${style}">`;
    });

  return (
    <div
      className="rounded-xl border bg-white p-3 overflow-hidden"
      onClick={(e) => {
        const el = e.target as HTMLElement | null;
        const g = el?.closest?.("g[data-iso2]") as HTMLElement | null;
        const iso2 = g?.getAttribute("data-iso2");
        if (iso2) onCountryClick(iso2);
      }}
      dangerouslySetInnerHTML={{ __html: enhanced }}
    />
  );
}

