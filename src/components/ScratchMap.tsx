"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchVisitedCountries, toggleVisitedCountry } from "../lib/db";
import { supabase } from "../lib/supabaseClient";
import { isAdminUser } from "../lib/auth";

type Visited = { iso3: string };

export function ScratchMap() {
  const [visited, setVisited] = useState<Visited[]>([]);
  const [loading, setLoading] = useState(true);
  const [canEdit, setCanEdit] = useState(false);

  const visitedSet = useMemo(() => new Set(visited.map((v) => v.iso3)), [visited]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);

      const session = (await supabase.auth.getSession()).data.session;
      setCanEdit(isAdminUser(session?.user?.id));

      if (session) {
        const rows = await fetchVisitedCountries();
        if (mounted) setVisited(rows.map((r) => ({ iso3: r.iso3 })));
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

  async function onCountryClick(iso3: string) {
    if (!canEdit) return;
    const isVisited = visitedSet.has(iso3);

    setVisited((prev) =>
      isVisited ? prev.filter((x) => x.iso3 !== iso3) : [...prev, { iso3 }]
    );

    try {
      await toggleVisitedCountry(iso3, !isVisited);
    } catch (e) {
      setVisited((prev) => prev);
      console.error(e);
      alert("Could not update visited countries. Check that you are logged in.");
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
  onCountryClick: (iso3: string) => void;
}) {
  const [svgText, setSvgText] = useState<string>("");

  useEffect(() => {
    fetch("/world-iso3.svg")
      .then((r) => r.text())
      .then(setSvgText)
      .catch(() => setSvgText(""));
  }, []);

  if (!svgText) return <div className="text-sm text-gray-600">Map asset missing.</div>;

  const enhanced = svgText
    .replaceAll("<svg", `<svg class="w-full h-auto select-none"`)
    .replaceAll(
      /<path([^>]*?)id="([A-Z]{3})"([^>]*?)>/g,
      (_m, a, iso3, b) => {
        const isVisited = visitedSet.has(iso3);
        const baseStyle =
          "cursor:pointer;transition:fill 120ms ease;stroke:#9CA3AF;stroke-width:0.5;";
        const fill = isVisited ? "fill:#111827;" : "fill:#F3F4F6;";
        const hover = "opacity:0.95;";
        return `<path${a}id="${iso3}"${b} style="${baseStyle}${fill}" data-hover="${hover}">`;
      }
    );

  return (
    <div
      className="rounded-xl border bg-white p-3 overflow-hidden"
      onClick={(e) => {
        const t = e.target as HTMLElement | null;
        const id = t?.getAttribute?.("id");
        if (id && /^[A-Z]{3}$/.test(id)) onCountryClick(id);
      }}
      dangerouslySetInnerHTML={{ __html: enhanced }}
    />
  );
}
