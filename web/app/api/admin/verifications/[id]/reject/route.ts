import "server-only";

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { SellerApplicationStatus } from "@prisma/client";
import { z } from "zod";

const rejectSchema = z.object({
  reason: z.string().min(1, "Razlog je obavezan"),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const body = await request.json();
    const validation = rejectSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { reason } = validation.data;

    // Find the application
    const application = await prisma.sellerApplication.findUnique({
      where: { id },
    });

    if (!application) {
      return NextResponse.json({ error: "Prijava nije pronađena" }, { status: 404 });
    }

    if (application.status === SellerApplicationStatus.REJECTED) {
      return NextResponse.json({ error: "Prijava je već odbijena" }, { status: 400 });
    }

    // Update application status with rejection reason
    await prisma.sellerApplication.update({
      where: { id },
      data: {
        status: SellerApplicationStatus.REJECTED,
        notes: reason,
      },
    });

    logger.info("Seller application rejected", {
      applicationId: id,
      userId: application.userId,
      reason,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error("Error rejecting seller application", {
      error: error.message,
      stack: error.stack,
    });

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Nemate dozvolu" }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Došlo je do greške. Pokušajte ponovo." },
      { status: 500 }
    );
  }
}

