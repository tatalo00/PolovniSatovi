import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MessageThreadView } from "@/components/messages/message-thread-view";

interface ThreadPageProps {
  params: Promise<{ threadId: string }>;
}

export default async function ThreadPage({ params }: ThreadPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const { threadId } = await params;

  return (
    <div className="h-[calc(100vh-12rem)] md:h-[600px]">
      <MessageThreadView threadId={threadId} />
    </div>
  );
}

