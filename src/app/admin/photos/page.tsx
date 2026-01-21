"use client";

import { useEffect, useState } from "react";
import { fetchTrips, uploadPhotoToTrip } from "@/lib/db";
import { supabase } from "@/lib/supabaseClient";
import { isAdminUser } from "@/lib/auth";

export default function UploadPhotosPage() {
  const [allowed, setAllowed] = useState(false);
  const [trips, setTrips] = useState<{ id: string; title: string }[]>([]);
  const [tripId, setTripId] = useState("");
  const [caption, setCaption] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const session = (await supabase.auth.getSession()).data.session;
      if (!session || !isAdminUser(session.user.id)) return setAllowed(false);
      setAllowed(true);

      const rows = await fetchTrips();
      setTrips(rows.map((t) => ({ id: t.id, title: t.title })));
      if (rows[0]) setTripId(rows[0].id);
    })();
  }, []);

  async function onUpload(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);

    if (!files?.length) return setStatus("Select at least one file.");
    if (!tripId) return setStatus("Select a trip.");

    try {
      for (const f of Array.from(files)) {
        await uploadPhotoToTrip(tripId, f, caption || undefined);
      }
      setStatus(`Uploaded ${files.length} file(s).`);
      setCaption("");
      setFiles(null);
    } catch (err: any) {
      setStatus(err?.message ?? "Upload failed.");
    }
  }

  if (!allowed) return <div className="p-6">Not authorized.</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-xl font-semibold">Upload photos</h1>

      <form onSubmit={onUpload} className="mt-4 space-y-3">
        <select
          className="w-full border rounded-lg p-2"
          value={tripId}
          onChange={(e) => setTripId(e.target.value)}
        >
          {trips.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>

        <input
          className="w-full border rounded-lg p-2"
          placeholder="Caption (optional)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />

        <input
          className="w-full border rounded-lg p-2"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setFiles(e.target.files)}
        />

        <button className="rounded-lg bg-black text-white px-4 py-2">
          Upload
        </button>
      </form>

      {status && <p className="mt-3 text-sm text-gray-700">{status}</p>}
    </div>
  );
}
