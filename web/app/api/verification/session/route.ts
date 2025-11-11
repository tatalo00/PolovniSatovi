import { NextRequest, NextResponse } from "next/server";
import { UserVerificationStatus } from "@prisma/client";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDiditClient } from "@/lib/kyc/didit";

export async function POST(request: NextRequest) {
  const user = await requireAuth();
  const userId = user.id;

  const existingVerification = await prisma.userVerification.findUnique({
    where: { userId },
  });

  if (
    existingVerification &&
    existingVerification.status === UserVerificationStatus.PENDING &&
    existingVerification.diditSessionUrl
  ) {
    return NextResponse.json({
      status: existingVerification.status,
      url: existingVerification.diditSessionUrl,
    });
  }

  const origin = request.nextUrl.origin;
  const callbackUrl =
    process.env.DIDIT_CALLBACK_URL ??
    process.env.DIDIT_SUCCESS_REDIRECT ??
    `${origin}/dashboard/profile?verification=success`;

  const session = await getDiditClient().createVerificationLink({
    referenceId: userId,
    callbackUrl,
    vendorData: userId,
  });

  await prisma.$transaction([
    prisma.userVerification.upsert({
      where: { userId },
      create: {
        userId,
        status: UserVerificationStatus.PENDING,
        diditSessionId: session.id,
        diditSessionUrl: session.url,
      },
      update: {
        status: UserVerificationStatus.PENDING,
        diditSessionId: session.id,
        diditSessionUrl: session.url,
        diditVerificationId: null,
        rejectionReason: null,
        statusDetail: null,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { isVerified: false },
    }),
  ]);

  return NextResponse.json({
    status: UserVerificationStatus.PENDING,
    url: session.url,
  });
}

