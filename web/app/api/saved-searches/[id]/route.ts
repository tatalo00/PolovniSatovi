import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/api-utils";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse("Unauthorized", 401);
    }

    const { id } = await params;

    const savedSearch = await prisma.savedSearch.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!savedSearch) {
      return errorResponse("Saved search not found", 404);
    }

    if (savedSearch.userId !== session.user.id) {
      return errorResponse("Forbidden", 403);
    }

    await prisma.savedSearch.delete({ where: { id } });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete saved search:", error);
    return errorResponse("Failed to delete saved search", 500);
  }
}
