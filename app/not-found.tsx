
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-neutral-950 px-6 text-neutral-100">
      <div className="w-full max-w-xl">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-green-400">
          SAY · Simplifying Algorithms for You
        </p>

        <div className="mt-12 border-l-2 border-green-500 pl-6">
          <p className="text-sm font-medium text-neutral-500">
            ERROR 404
          </p>

          <h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-7xl">
            Lost in the{" "}
            <span className="text-green-400">algorithm?</span>
          </h1>

          <p className="mt-6 max-w-md text-base leading-7 text-neutral-400">
            This page doesn't exist, or perhaps it took a path
            that wasn't meant to be. Let's get you back on track.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-6">
            <Link
              href="/"
              className="inline-flex items-center gap-3 bg-green-500 px-6 py-3.5 text-sm font-semibold text-neutral-950 hover:bg-green-400"
            >
              Back to home
              <span aria-hidden="true">→</span>
            </Link>

            <Link
              href="/competition"
              className="text-sm text-neutral-300 underline decoration-neutral-700 underline-offset-8 hover:text-white"
            >
              View competitions
            </Link>
          </div>
        </div>

        <div className="mt-20 border-t border-neutral-800 pt-5">
          <p className="text-xs text-neutral-600">
            Even the best algorithms encounter dead ends.
          </p>
        </div>
      </div>
    </main>
  );
}
