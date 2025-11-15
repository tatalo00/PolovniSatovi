import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDiditClient } from "@/lib/kyc/didit";
import { AUTHENTICATION_STATUS } from "@/lib/authentication/status";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  const user = await requireAuth();
  const userId = user.id;

  const existingAuthentication = await prisma.userAuthentication.findUnique({
    where: { userId },
  });

  if (
    existingAuthentication &&
    existingAuthentication.status === AUTHENTICATION_STATUS.PENDING &&
    existingAuthentication.diditSessionUrl
  ) {
    return NextResponse.json({
      status: existingAuthentication.status,
      url: existingAuthentication.diditSessionUrl,
    });
  }

  const origin = request.nextUrl.origin;
  const callbackUrl =
    process.env.DIDIT_CALLBACK_URL ??
    process.env.DIDIT_SUCCESS_REDIRECT ??
    `${origin}/dashboard/profile?authentication=success`;

  const referenceId = `${userId}-${Date.now()}-${randomUUID()}`;

  const session = await getDiditClient().createAuthenticationSession({
    referenceId,
    callbackUrl,
    vendorData: user.email ?? userId,
  });

  await prisma.userAuthentication.upsert({
    where: { userId },
    create: {
      userId,
      status: AUTHENTICATION_STATUS.PENDING,
      diditSessionId: session.id,
      diditSessionUrl: session.url,
    },
    update: {
      status: AUTHENTICATION_STATUS.PENDING,
      diditSessionId: session.id,
      diditSessionUrl: session.url,
      diditVerificationId: null,
      rejectionReason: null,
      statusDetail: null,
    },
  });

  return NextResponse.json({
    status: AUTHENTICATION_STATUS.PENDING,
    url: session.url,
  });
}
