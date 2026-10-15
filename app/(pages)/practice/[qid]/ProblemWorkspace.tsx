"use client";

import { useState } from "react";
import Link from "next/link";
import type { Problem } from "@/lib/problems";

export default function ProblemWorkspace({ problem }: { problem: Problem }) {
  const [language, setLanguage] = useState("cpp");
  const [activeTab, setActiveTab] = useState<"examples" | "custom">("examples");
  const [activeExample, setActiveExample] = useState(0);
  const [customInput, setCustomInput] = useState("");
  const [status, setStatus] = useState("");

  const templates: Record<string, string> = {
    cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    // Write your solution here

    return 0;
}`,
    python: `def solve():
    # Write your solution here
    pass


if __name__ == "__main__":
    solve()`,
  };

  const [code, setCode] = useState(templates.cpp);
  const selectedExample = problem.examples[activeExample];
  const [isSubmitting, setIsSubmitting] = useState(false);

  function changeLanguage(next: string) {
    setLanguage(next);
    setCode(templates[next]);
    setStatus("");
  }

  async function handleSubmit() {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setStatus("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setStatus("Please log in before submitting.");
        return;
      }


      const apiBase = "http://127.0.0.1:5001";

      const response = await fetch(`${apiBase}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          question_id: problem.number,
          question_title: problem.title,
          language,
          code,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus(data.message || data.error || "Submission failed.");
        return;
      }

      setStatus(
        `Submission saved! ID: ${data.submission_id}, file: ${data.filename}`
      );
    } catch (error) {
      console.error("Submission error:", error);
      setStatus(
        "Could not connect to the submission server. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }


  return (
    <main className="h-[calc(100vh-4rem)] min-h-[600px] overflow-hidden bg-neutral-950 text-neutral-100">
      <header className="flex h-12 items-center justify-between border-b border-neutral-800 px-4 sm:px-6">
        <div className="flex items-center gap-3 text-sm">
          <Link href="/competition" className="text-neutral-500 hover:text-white">
            Competition
          </Link>
          <span className="text-neutral-700">/</span>
          <span className="text-neutral-300">Problem {problem.number}</span>
        </div>
        <span className="text-xs text-neutral-500">SAY · Adaptive challenge</span>
      </header>

      <div className="grid h-[calc(100%-3rem)] grid-cols-1 overflow-y-auto lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:overflow-hidden">
        {/* Problem statement */}
        <section className="min-h-[500px] overflow-y-auto border-b border-neutral-800 p-5 sm:p-7 lg:border-b-0 lg:border-r lg:p-8">
          <div className="flex items-center gap-3 text-xs">
            <span className="text-neutral-500">
              PROBLEM {String(problem.number).padStart(2, "0")}
            </span>
            <span className={
              problem.difficulty === "Easy" ? "text-green-400" :
                problem.difficulty === "Medium" ? "text-yellow-400" :
                  "text-red-400"
            }>
              {problem.difficulty}
            </span>
          </div>

          <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
            {problem.title}
          </h1>

          <div className="mt-8 space-y-5 text-sm leading-7 text-neutral-300">
            {problem.description.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          <section className="mt-10">
            <h2 className="mb-5 text-base font-semibold">Examples</h2>
            <div className="space-y-5">
              {problem.examples.map((example, index) => (
                <div key={index} className="border-l-2 border-neutral-800 pl-4">
                  <p className="mb-3 text-sm font-medium text-neutral-300">
                    Example {index + 1}
                  </p>
                  <div className="space-y-2 bg-neutral-900 p-4 font-mono text-xs leading-6 sm:text-sm">
                    <p>
                      <span className="text-neutral-500">Input: </span>
                      <span className="whitespace-pre-wrap break-words">{example.input}</span>
                    </p>
                    <p>
                      <span className="text-neutral-500">Output: </span>
                      <span className="whitespace-pre-wrap break-words">{example.output}</span>
                    </p>
                    {example.explanation && (
                      <p className="pt-1 font-sans text-neutral-400">
                        <span className="text-neutral-500">Explanation: </span>
                        {example.explanation}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-10 pb-8">
            <h2 className="mb-4 text-base font-semibold">Constraints</h2>
            <ul className="space-y-2">
              {problem.constraints.map((constraint, index) => (
                <li key={index} className="flex gap-3 text-sm text-neutral-400">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-green-500" />
                  <code>{constraint}</code>
                </li>
              ))}
            </ul>
          </section>
        </section>

        {/* Editor and test cases */}
        <section className="flex min-h-[700px] flex-col lg:min-h-0">
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-neutral-800 px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Code</span>
              <span className="text-neutral-700">/</span>
              <label htmlFor="language" className="sr-only">Language</label>
              <select
                id="language"
                value={language}
                onChange={(event) => changeLanguage(event.target.value)}
                className="bg-neutral-950 text-sm text-neutral-300 outline-none"
              >
                <option value="cpp">C++</option>
                <option value="python">Python</option>

              </select>
            </div>
            <button
              type="button"
              onClick={() => {
                setCode(templates[language]);
                setStatus("");
              }}
              className="text-xs text-neutral-500 hover:text-white"
            >
              Reset code
            </button>
          </div>

          <div className="flex min-h-[380px] flex-1 flex-col lg:min-h-0">
            <div className="flex-1 bg-neutral-950">
              <label htmlFor="code-editor" className="sr-only">Write your solution</label>
              <textarea
                id="code-editor"
                value={code}
                onChange={(event) => {
                  setCode(event.target.value);
                  setStatus("");
                }}
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                className="h-full min-h-[380px] w-full resize-none bg-transparent p-5 font-mono text-sm leading-6 text-neutral-200 outline-none placeholder:text-neutral-700 lg:min-h-0"
                placeholder="Write your solution here..."
              />
            </div>

            {/* Test-case panel */}
            <div className="flex min-h-[280px] flex-col border-t border-neutral-800 lg:h-[36%] lg:min-h-[250px] lg:flex-none">
              <div className="flex h-12 shrink-0 gap-5 border-b border-neutral-800 px-5">
                <button
                  type="button"
                  onClick={() => setActiveTab("examples")}
                  className={`border-b-2 text-sm ${activeTab === "examples"
                    ? "border-green-500 text-white"
                    : "border-transparent text-neutral-500 hover:text-neutral-300"
                    }`}
                >
                  Test cases
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("custom")}
                  className={`border-b-2 text-sm ${activeTab === "custom"
                    ? "border-green-500 text-white"
                    : "border-transparent text-neutral-500 hover:text-neutral-300"
                    }`}
                >
                  Custom input
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-5">
                {activeTab === "examples" ? (
                  <>
                    <div className="mb-5 flex flex-wrap gap-2">
                      {problem.examples.map((_, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setActiveExample(index)}
                          className={`px-3 py-1.5 text-xs ${activeExample === index
                            ? "bg-neutral-800 text-white"
                            : "text-neutral-500 hover:text-neutral-300"
                            }`}
                        >
                          Case {index + 1}
                        </button>
                      ))}
                    </div>

                    {selectedExample && (
                      <div className="space-y-4">
                        <div>
                          <p className="mb-2 text-xs text-neutral-500">Input</p>
                          <pre className="whitespace-pre-wrap break-words bg-neutral-900 p-3 font-mono text-xs leading-5 text-neutral-300">
                            {selectedExample.input}
                          </pre>
                        </div>
                        <div>
                          <p className="mb-2 text-xs text-neutral-500">Expected output</p>
                          <pre className="whitespace-pre-wrap break-words bg-neutral-900 p-3 font-mono text-xs leading-5 text-green-300">
                            {selectedExample.output}
                          </pre>
                        </div>
                        {selectedExample.explanation && (
                          <p className="text-xs leading-5 text-neutral-500">
                            {selectedExample.explanation}
                          </p>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div>
                    <label htmlFor="custom-input" className="mb-3 block text-xs text-neutral-500">
                      Enter custom test input
                    </label>
                    <textarea
                      id="custom-input"
                      value={customInput}
                      onChange={(event) => setCustomInput(event.target.value)}
                      placeholder="Enter input..."
                      className="min-h-28 w-full resize-y border border-neutral-800 bg-neutral-900 p-3 font-mono text-sm text-neutral-200 outline-none placeholder:text-neutral-600 focus:border-green-500"
                    />
                  </div>
                )}

                {status && (
                  <p role="status" className="mt-5 border-l-2 border-yellow-500 pl-3 text-xs leading-5 text-neutral-400">
                    {status}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 items-center justify-between gap-3 border-t border-neutral-800 px-4 py-3 sm:px-5">
                <span className="hidden text-xs text-neutral-600 sm:inline">
                  Execution service pending
                </span>
                <div className="ml-auto flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus(
                      "Code execution is not connected yet. Your editor and test cases are ready for the execution API."
                    )}
                    className="border border-neutral-700 px-4 py-2 text-sm text-neutral-300 hover:border-neutral-500 hover:text-white"
                  >
                    Run
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-green-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
