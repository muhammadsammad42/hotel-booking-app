export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
        Hotel Booking App
      </h1>
      <p className="mt-4 max-w-md text-lg text-zinc-600 dark:text-zinc-400">
        Browse room types, check availability, and book your stay.
      </p>
      <p className="mt-8 rounded-full border border-zinc-200 px-4 py-1.5 text-sm text-zinc-500 dark:border-zinc-800">
        Coming soon
      </p>
    </main>
  );
}
