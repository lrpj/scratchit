"use client";

import { useState } from "react";
import { createTrip } from "@/src/lib/db";
import { supabase } from "@/src/lib/supabaseClient";
import { isAdminUser } from "@/src/lib/auth";

export default function NewTripPage() {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [summary, setSummary] = useState("");
  const [notes, setNotes] = useState("");
  const [countriesCsv, setCountriesCsv] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);

    const session = (await supabase.auth.getSession()).data.session;
    if (!session || !isAdminUser(session.user.id)) {
      setStatus("Not authorized.");
      return;
    }

    try {
      const countries = countriesCsv
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean);

      const trip = await createTrip({
        title,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        summary: summary || undefined,
        notes_markdown: notes || undefined,
        countries,
      });

      setStatus(`Created trip: ${trip.title}`);
      setTitle("");
      setStartDate("");
      setEndDate("");
      setSummary("");
      setNotes("");
      setCountriesCsv("");
    } catch (err: any) {
      setStatus(err?.message ?? "Error creating trip.");
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-xl font-semibold">New trip</h1>

      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <input
          className="w-full border rounded-lg p-2"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <input
            className="w-full border rounded-lg p-2"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            className="w-full border rounded-lg p-2"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <input
          className="w-full border rounded-lg p-2"
          placeholder="Countries ISO3 (comma separated), e.g. NOR,SWE,ESP"
          value={countriesCsv}
          onChange={(e) => setCountriesCsv(e.target.value)}
        />

        <input
          className="w-full border rounded-lg p-2"
          placeholder="Summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />

        <textarea
          className="w-full border rounded-lg p-2 min-h-[140px]"
          placeholder="Notes (Markdown)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <button className="rounded-lg bg-black text-white px-4 py-2">
          Create
        </button>
      </form>

      {status && <p className="mt-3 text-sm text-gray-700">{status}</p>}
    </div>
  );
}
