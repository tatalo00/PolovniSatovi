import "server-only";

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { z } from "zod";

const updateReportSchema = z.object({
  status: z.enum(["OPEN", "CLOSED"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await request.json();

    // Validate request body
    const validation = updateReportSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Neispravan zahtev. Status mora biti OPEN ili CLOSED." },
        { status: 400 }
      );
    }

    const { status } = validation.data;

    // Find report
    const report = await prisma.report.findUnique({
      where: { id },
    });

    if (!report) {
      return NextResponse.json(
        { error: "Prijava nije pronađena" },
        { status: 404 }
      );
    }

    // Update report status
    await prisma.report.update({
      where: { id },
      data: {
        status,
      },
    });

    logger.info("Report status updated", { reportId: id, status });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error("Error updating report status", {
      error: error.message,
      stack: error.stack,
    });

    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json(
        { error: "Nemate dozvolu za ovu akciju" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Došlo je do greške. Pokušajte ponovo." },
      { status: 500 }
    );
  }
}
