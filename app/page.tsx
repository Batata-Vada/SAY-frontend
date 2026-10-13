"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {

    const router = useRouter();

    const [name, setName] = useState("");

    useEffect(() => {

        async function getUser() {

            const token = localStorage.getItem("token");

            if (!token) {
                router.push("/register");
                return;
            }

            const response = await fetch(
                "http://127.0.0.1:5001/me",
                {
                    headers: {
                        "Authorization": token
                    }
                }
            );

            const data = await response.json();

            if (response.ok) {

                setName(data.name);

            } else {

                localStorage.removeItem("token");
                router.push("/login");

            }
        }

        getUser();

    }, [router]);


    async function logout() {

        const token = localStorage.getItem("token");

        const response = await fetch(
            "http://127.0.0.1:5001/logout",
            {
                method: "POST",
                headers: {
                    "Authorization": token || ""
                }
            }
        );

        const data = await response.json();

        console.log(data);

        if (response.ok) {

            localStorage.removeItem("token");

            router.push("/login");
        }
    }




const steps = [
  {
    number: "01",
    title: "Solve",
    description:
      "Everyone starts with the same problem. Think, code, and submit your solution.",
  },
  {
    number: "02",
    title: "Adapt",
    description:
      "Your next problem is selected based on how you performed on the previous one.",
  },
  {
    number: "03",
    title: "Compete",
    description:
      "Challenge yourself alongside others, each following a path suited to their progress.",
  },
];


  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Hero */}
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-16 px-6 py-20 md:grid-cols-[1.15fr_0.85fr] md:px-12 lg:px-16">
        <div>
          <p className="mb-8 text-xs font-medium uppercase tracking-[0.3em] text-green-400">
            Simplifying Algorithms for You
          </p>

          <h1 className="max-w-3xl text-5xl font-semibold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
            One starting point.
            <span className="mt-2 block text-green-400">
              Your own challenge.
            </span>
          </h1>

          <p className="mt-8 max-w-xl text-base leading-8 text-neutral-400 sm:text-lg">
            Competitive programming, reimagined. Everyone starts with
            the same problem, but every next challenge adapts to how
            you solve the last one.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-6">
            <Link
              href="/competition"
              className="inline-flex items-center gap-3 bg-green-500 px-6 py-3.5 text-sm font-semibold text-neutral-950 transition-colors hover:bg-green-400"
            >
              Start competing
              <span aria-hidden="true">→</span>
            </Link>

            <a
              href="#how-it-works"
              className="text-sm text-neutral-300 underline decoration-neutral-700 underline-offset-8 hover:text-white"
            >
              How it works
            </a>
          </div>

          <div className="mt-16 border-t border-neutral-800 pt-6">
            <p className="text-sm text-neutral-500">
              Not just about solving problems.
            </p>
            <p className="mt-1 text-sm text-neutral-300">
              About finding out what you can solve next.
            </p>
          </div>
        </div>

        {/* Adaptive problem flow */}
        <div className="w-full max-w-lg md:ml-auto">
          <div className="mb-8 flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">
              A different path for everyone
            </span>
            <span className="h-2 w-2 rounded-full bg-green-400" />
          </div>

          {/* Shared starting problem */}
          <div className="flex flex-col items-center">
            <div className="w-full border border-neutral-700 px-5 py-5">
              <p className="text-xs text-neutral-500">STARTING PROBLEM</p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="font-medium">Problem 01</span>
                <span className="border border-neutral-700 px-2 py-1 text-xs text-neutral-400">
                  Shared
                </span>
              </div>
            </div>

            <div className="h-8 w-px bg-neutral-700" />

            <div className="h-px w-3/4 bg-neutral-700" />

            <div className="grid w-full grid-cols-2">
              <div className="flex flex-col items-center">
                <div className="h-6 w-px bg-neutral-700" />
                <div className="h-2 w-2 rounded-full bg-green-400" />
              </div>
              <div className="flex flex-col items-center">
                <div className="h-6 w-px bg-neutral-700" />
                <div className="h-2 w-2 rounded-full bg-neutral-500" />
              </div>
            </div>
          </div>

          {/* Different next problems */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border-l-2 border-green-500 py-4 pl-4">
              <p className="text-xs text-green-400">PERFORMING WELL</p>
              <h3 className="mt-3 text-lg font-medium">Problem 02</h3>
              <p className="mt-1 text-sm text-neutral-400">
                Increased difficulty
              </p>
              <div className="mt-5 flex gap-1.5">
                <span className="h-1 w-8 bg-green-500" />
                <span className="h-1 w-8 bg-green-500" />
                <span className="h-1 w-8 bg-green-500" />
                <span className="h-1 w-4 bg-neutral-800" />
              </div>
            </div>

            <div className="border-l-2 border-neutral-700 py-4 pl-4">
              <p className="text-xs text-neutral-500">NEEDS MORE PRACTICE</p>
              <h3 className="mt-3 text-lg font-medium">Problem 02</h3>
              <p className="mt-1 text-sm text-neutral-400">
                Same or lower level
              </p>
              <div className="mt-5 flex gap-1.5">
                <span className="h-1 w-8 bg-neutral-500" />
                <span className="h-1 w-8 bg-neutral-800" />
                <span className="h-1 w-8 bg-neutral-800" />
                <span className="h-1 w-4 bg-neutral-800" />
              </div>
            </div>
          </div>

          <p className="mt-8 border-t border-neutral-800 pt-5 text-sm leading-6 text-neutral-500">
            Same beginning. Different challenges. Progress at your
            own level.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="border-t border-neutral-800"
      >
        <div className="mx-auto max-w-7xl px-6 py-24 md:px-12 lg:px-16">
          <div className="mb-16 max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-green-400">
              The idea behind SAY
            </p>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
              A competition that adapts to you.
            </h2>
            <p className="mt-5 leading-7 text-neutral-400">
              Traditional contests give everyone the same sequence of
              problems. SAY takes a different approach: your previous
              solution helps determine what you face next.
            </p>
          </div>

          <div className="grid gap-10 md:grid-cols-3 md:gap-12">
            {steps.map((step) => (
              <div
                key={step.number}
                className="border-t border-neutral-800 pt-6"
              >
                <span className="text-sm font-medium text-green-400">
                  {step.number}
                </span>
                <h3 className="mt-5 text-xl font-medium">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-sm text-sm leading-7 text-neutral-400">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-20 flex flex-col justify-between gap-6 border-t border-neutral-800 pt-8 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-xl font-medium">
                Ready to find your next challenge?
              </h3>
              <p className="mt-2 text-sm text-neutral-500">
                Start with one problem. See where it takes you.
              </p>
            </div>

            <Link
              href="/competition"
              className="inline-flex w-fit items-center gap-3 border border-green-500 px-5 py-3 text-sm font-medium text-green-400 hover:bg-green-500 hover:text-neutral-950"
            >
              Enter SAY <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-6 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between md:px-12 lg:px-16">
          <span className="font-semibold tracking-wide text-neutral-300">
            SAY
          </span>
          <span>Simplifying Algorithms for You.</span>
        </div>
      </footer>
    </main>
  );
}
