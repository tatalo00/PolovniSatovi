import "server-only";

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { z } from "zod";

const reportSchema = z.object({
  reason: z.string().min(5, "Razlog mora imati najmanje 5 karaktera"),
});

// POST - Report a listing
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const userId = (user as any).id;
    const { id } = await params;

    // Find listing
    const listing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Oglas nije pronađen" },
        { status: 404 }
      );
    }

    // Can't report your own listing
    if (listing.sellerId === userId) {
      return NextResponse.json(
        { error: "Ne možete prijaviti sopstveni oglas" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validation = reportSchema.safeParse(body);

    if (validation.success == false) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { reason } = validation.data;

    // Check if user already reported this listing
    const existingReport = await prisma.report.findFirst({
      where: {
        listingId: id,
        reporterId: userId,
        status: "OPEN",
      },
    });

    if (existingReport) {
      return NextResponse.json(
        { error: "Već ste prijavili ovaj oglas" },
        { status: 400 }
      );
    }

    // Create report
    await prisma.report.create({
      data: {
        listingId: id,
        reporterId: userId,
        reason,
        status: "OPEN",
      },
    });

    logger.info("Listing reported", { listingId: id, reporterId: userId });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error("Error reporting listing", { error: error.message });
    if (error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Morate biti prijavljeni" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Došlo je do greške" },
      { status: 500 }
    );
  }
}
