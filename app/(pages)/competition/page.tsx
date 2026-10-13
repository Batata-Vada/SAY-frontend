
import Link from "next/link";
import { problems } from "@/lib/problems";

export default function CompetitionPage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-neutral-950 px-6 py-16 text-neutral-100 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs uppercase tracking-[0.25em] text-green-400">
          SAY / Competition
        </p>

        <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
          Choose your challenge.
        </h1>

        <p className="mt-5 max-w-xl text-sm leading-7 text-neutral-400">
          Every problem is an opportunity to improve. Start solving
          and let your performance guide your next challenge.
        </p>

        <div className="mt-12 border-t border-neutral-800">
          {problems.map((problem) => (
            <Link
              key={problem.qid}
              href={`/competition/${problem.qid}`}
              className="group grid grid-cols-[48px_1fr_auto] items-center gap-4 border-b border-neutral-800 py-6"
            >
              <span className="font-mono text-sm text-neutral-600">
                {String(problem.number).padStart(2, "0")}
              </span>

              <div>
                <h2 className="font-medium group-hover:text-green-400">
                  {problem.title}
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
                  {problem.difficulty}
                </p>
              </div>

              <span className="text-neutral-600 group-hover:text-green-400">
                →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
