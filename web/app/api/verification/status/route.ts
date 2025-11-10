import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await requireAuth();
  const verification = await prisma.userVerification.findUnique({
    where: { userId: user.id },
    select: {
      id: true,
      status: true,
      diditSessionUrl: true,
      diditVerificationId: true,
      rejectionReason: true,
      statusDetail: true,
      updatedAt: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    isVerified: user.isVerified ?? false,
    verification,
  });
}

