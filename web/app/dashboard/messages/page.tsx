import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MessageThreadList } from "@/components/messages/message-thread-list";

export default async function MessagesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Poruke</h1>
        <p className="text-muted-foreground mt-2">
          Pregledajte svoje konverzacije
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <MessageThreadList />
      </div>
    </main>
  );
}

