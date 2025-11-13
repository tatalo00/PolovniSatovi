import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await requireAuth();
  const authentication = await prisma.userAuthentication.findUnique({
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
    isVerifiedSeller: user.isVerified ?? false,
    authentication,
  });
}
