import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MessageThreadView } from "@/components/messages/message-thread-view";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

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
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Poruke", href: "/dashboard/messages" },
          { label: "Konverzacija" },
        ]}
      />
      <div className="h-[calc(100vh-14rem)] md:h-[600px]">
        <MessageThreadView threadId={threadId} />
      </div>
    </div>
  );
}

