
import { notFound } from "next/navigation";
import { getProblem } from "@/lib/problems";
import ProblemWorkspace from "./ProblemWorkspace";

export default async function CompetitionProblemPage({
  params,
}: {
  params: Promise<{ qid: string }>;
}) {
  const { qid } = await params;
  const problem = getProblem(qid);

  if (!problem) {
    notFound();
  }

  return <ProblemWorkspace problem={problem} />;
}
