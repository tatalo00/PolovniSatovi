import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

const MessageThreadList = dynamic(
  () => import("@/components/messages/message-thread-list").then(mod => ({ default: mod.MessageThreadList })),
  { ssr: true, loading: () => <div className="h-64 animate-pulse rounded-lg bg-muted" /> }
);

export default async function MessagesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Poruke" },
        ]}
      />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Poruke</h1>
        <p className="text-muted-foreground mt-2">
          Pregledajte svoje konverzacije
        </p>
      </div>

      <MessageThreadList />
    </div>
  );
}

