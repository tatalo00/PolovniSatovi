import "server-only";

import { createHmac, timingSafeEqual } from "crypto";

interface DiditConfig {
  apiKey: string;
  baseUrl: string;
  webhookSecret: string;
  workflowId: string;
  defaultCallbackUrl?: string | null;
}

interface CreateAuthenticationSessionPayload {
  referenceId: string;
  workflowId?: string;
  callbackUrl?: string | null;
  vendorData?: string | null;
}

interface DiditLinkResponse {
  id: string;
  url: string;
  workflowId?: string | null;
  qrCodeUrl?: string | null;
  expiresAt?: string | null;
}

export class DiditClient {
  private config: DiditConfig;

  constructor(config?: Partial<DiditConfig>) {
    const envConfig: DiditConfig = {
      apiKey: process.env.DIDIT_API_KEY ?? "",
      baseUrl: process.env.DIDIT_BASE_URL ?? "https://verification.didit.me",
      webhookSecret: process.env.DIDIT_WEBHOOK_SECRET ?? "",
      workflowId: process.env.DIDIT_WORKFLOW_ID ?? "",
      defaultCallbackUrl: process.env.DIDIT_CALLBACK_URL ?? null,
    };

    this.config = {
      ...envConfig,
      ...config,
    };

    if (!this.config.apiKey) {
      throw new Error("Missing DIDIT_API_KEY environment variable");
    }

    if (!this.config.webhookSecret) {
      throw new Error("Missing DIDIT_WEBHOOK_SECRET environment variable");
    }

    if (!this.config.workflowId) {
      throw new Error("Missing DIDIT_WORKFLOW_ID environment variable");
    }
  }

  async createAuthenticationSession(
    payload: CreateAuthenticationSessionPayload
  ): Promise<DiditLinkResponse> {
    const baseUrl = this.config.baseUrl.replace(/\/$/, "");

    const requestBody: Record<string, unknown> = {
      workflow_id: payload.workflowId ?? this.config.workflowId,
      reference_id: payload.referenceId,
    };

    const callbackUrl =
      payload.callbackUrl ?? this.config.defaultCallbackUrl ?? undefined;
    if (callbackUrl) {
      requestBody.callback = callbackUrl;
    }

    const vendorData = payload.vendorData ?? payload.referenceId;
    if (vendorData) {
      requestBody.vendor_data = vendorData;
    }

    const response = await fetch(`${baseUrl}/v2/session/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.config.apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Didit create session failed: ${response.status} ${text}`);
    }

    const data = (await response.json()) as {
      id?: string;
      session_id?: string;
      workflow_id?: string;
      session_url?: string;
      url?: string;
      qr_code?: { url?: string | null } | null;
      qr_code_url?: string | null;
      expires_at?: string | null;
    };

    const sessionUrl = data.session_url ?? data.url;
    if (!sessionUrl) {
      throw new Error("Didit create session failed: missing session URL in response");
    }

    const sessionId = data.id ?? data.session_id;
    if (!sessionId) {
      throw new Error("Didit create session failed: missing session identifier in response");
    }

    return {
      id: sessionId,
      url: sessionUrl,
      workflowId: data.workflow_id ?? null,
      qrCodeUrl: data.qr_code?.url ?? data.qr_code_url ?? null,
      expiresAt: data.expires_at ?? null,
    };
  }

  verifyWebhookSignature(signatureHeader: string | null, rawBody: string): boolean {
    if (!signatureHeader) {
      return false;
    }

    const expected = createHmac("sha256", this.config.webhookSecret)
      .update(rawBody)
      .digest();

    const provided = Buffer.from(signatureHeader, "hex");

    if (expected.length !== provided.length) {
      return false;
    }

    return timingSafeEqual(expected, provided);
  }
}

let cachedClient: DiditClient | null = null;

export function getDiditClient(config?: Partial<DiditConfig>) {
  if (config || !cachedClient) {
    cachedClient = new DiditClient(config);
  }
  return cachedClient;
}


