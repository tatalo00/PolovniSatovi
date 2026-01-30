import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MessageThreadList } from "@/components/messages/message-thread-list";

export default async function MessagesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className="space-y-6">
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

