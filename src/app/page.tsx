import { TopBar } from "../components/TopBar";
import { ScratchMap } from "../components/ScratchMap";
import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      <TopBar />
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
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
        </section>
      </main>
    </div>
  );
}
