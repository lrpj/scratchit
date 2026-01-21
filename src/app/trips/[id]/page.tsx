"use client";

import { useEffect, useState } from "react";
import { fetchTripById, getPrivatePhotoUrl } from "@/src/lib/db";
import { TopBar } from "@/src/components/TopBar";

export default function TripDetailPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchTripById(params.id);
        setData(res);

        const urlMap: Record<string, string> = {};
        for (const p of res.photos) {
          urlMap[p.id] = await getPrivatePhotoUrl(p.storage_path);
        }
        setPhotoUrls(urlMap);
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load trip");
      }
    })();
  }, [params.id]);

  return (
    <div>
      <TopBar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        {err && <p className="text-sm text-gray-700">{err}</p>}
        {!data && !err && <p className="text-sm text-gray-600">Loading...</p>}

        {data?.trip && (
          <>
            <h1 className="text-2xl font-semibold">{data.trip.title}</h1>
            <p className="text-sm text-gray-600 mt-1">
              {data.trip.start_date ?? "?"} to {data.trip.end_date ?? "?"}
            </p>

            {data.countries?.length > 0 && (
              <p className="mt-3 text-sm text-gray-700">
                Countries: {data.countries.map((c: any) => c.iso3).join(", ")}
              </p>
            )}

            {data.trip.summary && <p className="mt-3 text-gray-800">{data.trip.summary}</p>}

            {data.trip.notes_markdown && (
              <pre className="mt-4 whitespace-pre-wrap rounded-xl border bg-white p-4 text-sm">
                {data.trip.notes_markdown}
              </pre>
            )}

            {data.photos?.length > 0 && (
              <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
                {data.photos.map((p: any) => (
                  <figure key={p.id} className="rounded-xl border bg-white overflow-hidden">
                    {photoUrls[p.id] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photoUrls[p.id]} alt={p.caption ?? "photo"} className="w-full h-auto" />
                    ) : (
                      <div className="p-4 text-sm text-gray-600">Loading image...</div>
                    )}
                    {p.caption && <figcaption className="p-2 text-sm text-gray-700">{p.caption}</figcaption>}
                  </figure>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
