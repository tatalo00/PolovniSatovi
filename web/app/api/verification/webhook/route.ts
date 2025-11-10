import { NextRequest, NextResponse } from "next/server";
import { UserVerificationStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getDiditClient } from "@/lib/kyc/didit";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("didit-signature");

  const client = getDiditClient();

  if (!client.verifyWebhookSignature(signature, rawBody)) {
    logger.warn("Didit webhook signature verification failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch (error) {
    logger.error("Failed to parse Didit webhook payload", { error });
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = (payload?.data ?? payload) as Record<string, unknown>;
  const sessionId =
    (data?.verification_session_id as string | undefined) ??
    (data?.session_id as string | undefined) ??
    (data?.id as string | undefined) ??
    null;

  if (!sessionId) {
    logger.warn("Didit webhook missing session identifier", { payload });
    return NextResponse.json({ ok: true });
  }

  const verificationRecord = await prisma.userVerification.findFirst({
    where: { diditSessionId: sessionId },
  });

  if (!verificationRecord) {
    logger.warn("Didit webhook received for unknown session", { sessionId });
    return NextResponse.json({ ok: true });
  }

  const diditVerificationId =
    (data?.verification_id as string | undefined) ??
    (data?.id as string | undefined) ??
    verificationRecord.diditVerificationId ??
    null;

  let nextStatus = verificationRecord.status;
  let rejectionReason: string | null = null;
  let statusDetail: string | null = null;

  const diditStatus = typeof data?.status === "string" ? data.status.toLowerCase() : undefined;
  const diditReason =
    (typeof data?.reason === "string" && data.reason) ||
    (typeof data?.message === "string" && data.message) ||
    (typeof data?.status_detail === "string" && data.status_detail) ||
    null;

  if (
    diditStatus === "approved" ||
    diditStatus === "completed" ||
    diditStatus === "verified" ||
    diditStatus === "success"
  ) {
    nextStatus = UserVerificationStatus.APPROVED;
  } else if (diditStatus === "declined" || diditStatus === "failed") {
    nextStatus = UserVerificationStatus.REJECTED;
    rejectionReason =
      diditReason ?? "Verifikacija nije uspela na Didit platformi. Molimo pokušajte ponovo.";
  } else if (diditStatus === "canceled") {
    nextStatus = UserVerificationStatus.CANCELED;
    statusDetail = diditReason ?? "Verifikacija je otkazana na Didit platformi.";
  } else {
    nextStatus = UserVerificationStatus.PENDING;
    statusDetail = diditReason;
  }

  await prisma.$transaction([
    prisma.userVerification.update({
      where: { userId: verificationRecord.userId },
      data: {
        diditVerificationId,
        status: nextStatus,
        rejectionReason,
        statusDetail,
      },
    }),
    prisma.user.update({
      where: { id: verificationRecord.userId },
      data: { isVerified: nextStatus === UserVerificationStatus.APPROVED },
    }),
  ]);

  return NextResponse.json({ ok: true });
}

