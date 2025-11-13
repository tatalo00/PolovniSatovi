import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getDiditClient } from "@/lib/kyc/didit";
import { logger } from "@/lib/logger";
import { AUTHENTICATION_STATUS } from "@/lib/authentication/status";

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

  const authenticationRecord = await prisma.userAuthentication.findFirst({
    where: { diditSessionId: sessionId },
  });

  if (!authenticationRecord) {
    logger.warn("Didit webhook received for unknown session", { sessionId });
    return NextResponse.json({ ok: true });
  }

  const diditVerificationId =
    (data?.verification_id as string | undefined) ??
    (data?.id as string | undefined) ??
    authenticationRecord.diditVerificationId ??
    null;

  let nextStatus = authenticationRecord.status;
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
    nextStatus = AUTHENTICATION_STATUS.APPROVED;
  } else if (diditStatus === "declined" || diditStatus === "failed") {
    nextStatus = AUTHENTICATION_STATUS.REJECTED;
    rejectionReason =
      diditReason ?? "Autentifikacija nije uspela na Didit platformi. Molimo pokušajte ponovo.";
  } else if (diditStatus === "canceled") {
    nextStatus = AUTHENTICATION_STATUS.CANCELED;
    statusDetail = diditReason ?? "Autentifikacija je otkazana na Didit platformi.";
  } else {
    nextStatus = AUTHENTICATION_STATUS.PENDING;
    statusDetail = diditReason;
  }

  await prisma.userAuthentication.update({
    where: { userId: authenticationRecord.userId },
    data: {
      diditVerificationId,
      status: nextStatus,
      rejectionReason,
      statusDetail,
    },
  });

  return NextResponse.json({ ok: true });
}
