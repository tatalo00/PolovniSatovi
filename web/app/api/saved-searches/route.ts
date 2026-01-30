import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/api-utils";
import { z } from "zod";

const MAX_SAVED_SEARCHES = 20;

const createSchema = z.object({
  name: z
    .string()
    .min(1, "Ime pretrage je obavezno")
    .max(100, "Ime pretrage može imati maksimalno 100 karaktera"),
  filters: z.record(z.string(), z.string()),
  notifyEmail: z.boolean().optional().default(false),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse("Unauthorized", 401);
    }

    const searches = await prisma.savedSearch.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: MAX_SAVED_SEARCHES,
    });

    return NextResponse.json({ data: searches });
  } catch (error) {
    console.error("Failed to fetch saved searches:", error);
    return errorResponse("Failed to fetch saved searches", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const validation = createSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.issues[0].message, 400);
    }

    const { name, filters, notifyEmail } = validation.data;

    // Check limit
    const count = await prisma.savedSearch.count({
      where: { userId: session.user.id },
    });

    if (count >= MAX_SAVED_SEARCHES) {
      return errorResponse(
        `Možete sačuvati najviše ${MAX_SAVED_SEARCHES} pretraga`,
        400
      );
    }

    const savedSearch = await prisma.savedSearch.create({
      data: {
        userId: session.user.id,
        name,
        filters,
        notifyEmail,
      },
    });

    return NextResponse.json({ data: savedSearch }, { status: 201 });
  } catch (error) {
    console.error("Failed to create saved search:", error);
    return errorResponse("Failed to create saved search", 500);
  }
}
