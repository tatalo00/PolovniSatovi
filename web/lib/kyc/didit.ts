import "server-only";

import { createHmac, timingSafeEqual } from "crypto";

interface DiditConfig {
  apiKey: string;
  baseUrl: string;
  webhookSecret: string;
}

interface CreateVerificationSessionPayload {
  referenceId: string;
  successRedirectUrl: string;
  failureRedirectUrl: string;
}

interface DiditSessionResponse {
  id: string;
  status: string;
  url: string;
}

export class DiditClient {
  private config: DiditConfig;

  constructor(config?: Partial<DiditConfig>) {
    const envConfig: DiditConfig = {
      apiKey: process.env.DIDIT_API_KEY ?? "",
      baseUrl: process.env.DIDIT_BASE_URL ?? "https://api.getdidit.com",
      webhookSecret: process.env.DIDIT_WEBHOOK_SECRET ?? "",
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
  }

  async createVerificationSession(
    payload: CreateVerificationSessionPayload
  ): Promise<DiditSessionResponse> {
    const response = await fetch(`${this.config.baseUrl}/v1/verifications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        reference_id: payload.referenceId,
        redirect_urls: {
          success: payload.successRedirectUrl,
          failure: payload.failureRedirectUrl,
        },
        verification_types: ["identity"],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Didit create session failed: ${response.status} ${text}`);
    }

    return response.json() as Promise<DiditSessionResponse>;
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


