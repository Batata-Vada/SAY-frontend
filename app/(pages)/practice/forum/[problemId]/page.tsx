import { notFound } from "next/navigation";
import ForumDiscussion from "./ForumDiscussion";

export default async function ProblemForumPage({
    params,
}: {
    params: Promise<{ problemId: string }>;
}) {
    const { problemId } = await params;
    const id = Number(problemId);

    if (!Number.isSafeInteger(id) || id < 1) {
        notFound();
    }

    return <ForumDiscussion problemId={id} />;
}