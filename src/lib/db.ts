import { supabase } from "./supabaseClient";

export type Trip = {
  id: string;
  title: string;
  start_date: string | null;
  end_date: string | null;
  summary: string | null;
  notes_markdown: string | null;
  created_at: string;
};

export async function fetchVisitedCountries() {
  const { data, error } = await supabase
    .from("visited_countries")
    .select("code");
  if (error) throw error;
  return data ?? [];
}

export async function toggleVisitedCountry(code: string, makeVisited: boolean) {
  if (makeVisited) {
    const { error } = await supabase.from("visited_countries").upsert({ code });
    if (error) throw error;
  } else {
    const { error } = await supabase.from("visited_countries").delete().eq("code", code);
    if (error) throw error;
  }
}


export async function fetchTrips() {
  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .order("start_date", { ascending: false, nullsFirst: false });
  if (error) throw error;
  return (data ?? []) as Trip[];
}

export async function createTrip(input: {
  title: string;
  start_date?: string;
  end_date?: string;
  summary?: string;
  notes_markdown?: string;
  countries?: string[];
}) {
  const { data: trip, error } = await supabase
    .from("trips")
    .insert({
      title: input.title,
      start_date: input.start_date ?? null,
      end_date: input.end_date ?? null,
      summary: input.summary ?? null,
      notes_markdown: input.notes_markdown ?? null,
    })
    .select("*")
    .single();

  if (error) throw error;
  if (!trip) throw new Error("Trip insert failed");

  const countries = (input.countries ?? []).filter(Boolean);
  if (countries.length) {
    const rows = countries.map((iso2) => ({ trip_id: trip.id, iso2 }));
    const { error: joinError } = await supabase.from("trip_countries").insert(rows);
    if (joinError) throw joinError;
  }

  return trip as Trip;
}

export async function fetchTripById(id: string) {
  const { data: trip, error } = await supabase
    .from("trips")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;

  const { data: countries, error: cErr } = await supabase
    .from("trip_countries")
    .select("iso3")
    .eq("trip_id", id);
  if (cErr) throw cErr;

  const { data: photos, error: pErr } = await supabase
    .from("photos")
    .select("*")
    .eq("trip_id", id)
    .order("created_at", { ascending: false });
  if (pErr) throw pErr;

  return { trip, countries: countries ?? [], photos: photos ?? [] };
}

export async function uploadPhotoToTrip(tripId: string, file: File, caption?: string) {
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr) throw userErr;
  if (!user) throw new Error("Not authenticated");

  const ext = file.name.split(".").pop() || "jpg";
  const fileName = `${crypto.randomUUID()}.${ext}`;
  const path = `${user.id}/${tripId}/${fileName}`;

  const { error: upErr } = await supabase.storage
    .from("travel-photos")
    .upload(path, file, { upsert: false });

  if (upErr) throw upErr;

  const { error: dbErr } = await supabase.from("photos").insert({
    trip_id: tripId,
    storage_path: path,
    caption: caption ?? null,
  });

  if (dbErr) throw dbErr;
}

export async function getPrivatePhotoUrl(storagePath: string) {
  const { data, error } = await supabase.storage
    .from("travel-photos")
    .createSignedUrl(storagePath, 60 * 60);
  if (error) throw error;
  return data.signedUrl;
}
