import "server-only";

function getBrevoApiKey() {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error("BREVO_API_KEY environment variable is not set");
  }
  return apiKey;
}

async function sendBrevoEmail({
  to,
  subject,
  htmlContent,
  sender = { email: "info@polovnisatovi.net", name: "PolovniSatovi" },
  replyTo,
  tags,
}: {
  to: Array<{ email: string; name?: string | null }>;
  subject: string;
  htmlContent: string;
  sender?: { email: string; name?: string | null };
  replyTo?: { email: string; name?: string | null };
  tags?: string[];
}) {
  const apiKey = getBrevoApiKey();

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: {
        email: sender.email,
        name: sender.name ?? undefined,
      },
      to: to.map((recipient) => ({
        email: recipient.email,
        name: recipient.name ?? undefined,
      })),
      subject,
      htmlContent,
      replyTo: replyTo
        ? {
            email: replyTo.email,
            name: replyTo.name ?? undefined,
          }
        : undefined,
      tags,
    }),
  });

  if (!response.ok) {
    const errorPayload = await response.text();
    throw new Error(
      `Brevo email failed with status ${response.status}: ${errorPayload}`
    );
  }

  const data = (await response.json()) as { messageId?: string };
  return { success: true as const, id: data.messageId };
}

export async function sendContactEmail({
  to,
  listingTitle,
  listingId,
  buyerName,
  buyerEmail,
  message,
}: {
  to: string;
  listingTitle: string;
  listingId: string;
  buyerName?: string;
  buyerEmail: string;
  message: string;
}) {
  try {
    const htmlContent = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><h2>Nova poruka za vaš oglas</h2><p>Dobili ste novu poruku za vaš oglas: <strong>${listingTitle}</strong></p><div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;"><p><strong>Od:</strong> ${buyerName || buyerEmail}</p><p><strong>Email:</strong> ${buyerEmail}</p></div><div style="background-color: #ffffff; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;"><p>${message.replace(/\n/g, "<br>")}</p></div><p style="margin-top: 20px;"><a href="${process.env.NEXTAUTH_URL}/listing/${listingId}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Pogledaj oglas</a></p><p style="margin-top: 20px; color: #666; font-size: 12px;">Možete odgovoriti direktno na ovaj email da kontaktirate kupca.</p></div>`;

    return await sendBrevoEmail({
      to: [{ email: to }],
      subject: `Nova poruka za vaš oglas: ${listingTitle}`,
      htmlContent,
      replyTo: { email: buyerEmail, name: buyerName ?? undefined },
      tags: ["contact-request"],
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}

export async function sendListingStatusEmail({
  to,
  listingTitle,
  status,
  reason,
}: {
  to: string;
  listingTitle: string;
  status: "APPROVED" | "REJECTED";
  reason?: string;
}) {
  try {
    const isApproved = status === "APPROVED";
    const subject = isApproved
      ? `Vaš oglas je odobren: ${listingTitle}`
      : `Vaš oglas je odbijen: ${listingTitle}`;

    const htmlContent = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><h2>${isApproved ? "Oglas odobren" : "Oglas odbijen"}</h2><p>Vaš oglas <strong>${listingTitle}</strong> je ${isApproved ? "odobren" : "odbijen"}.</p>${
      reason && !isApproved
        ? `<div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;"><p><strong>Razlog:</strong></p><p>${reason}</p></div>`
        : ""
    }${
      isApproved
        ? `<p style="margin-top: 20px;"><a href="${process.env.NEXTAUTH_URL}/dashboard/listings" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Upravljaj oglasima</a></p>`
        : `<p style="margin-top: 20px;"><a href="${process.env.NEXTAUTH_URL}/dashboard/listings" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Pregledaj oglase</a></p>`
    }</div>`;

    return await sendBrevoEmail({
      to: [{ email: to }],
      subject,
      htmlContent,
      tags: ["listing-status", status.toLowerCase()],
    });
  } catch (error) {
    console.error("Error sending status email:", error);
    return { success: false, error };
  }
}

export async function sendWelcomeEmail({ to, name }: { to: string; name?: string }) {
  try {
    const htmlContent = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><h2>Dobrodošli na PolovniSatovi!</h2><p>Hvala vam što ste se registrovali, ${name || ""}!</p><p>Možete početi da:</p><ul><li>Pretražujete oglase za polovne i vintage satove</li><li>Kontaktirate prodavce</li><li>Kreirate oglase i prodajete svoje satove</li></ul><p style="margin-top: 20px;"><a href="${process.env.NEXTAUTH_URL}/listings" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Pregledaj oglase</a></p></div>`;

    return await sendBrevoEmail({
      to: [{ email: to, name }],
      subject: "Dobrodošli na PolovniSatovi",
      htmlContent,
      tags: ["welcome"],
    });
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return { success: false, error };
  }
}

export async function sendPasswordResetEmail({
  to,
  name,
  resetToken,
}: {
  to: string;
  name?: string;
  resetToken: string;
}) {
  try {
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;
    const htmlContent = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><h2>Resetovanje šifre</h2><p>Zdravo ${name || ""},</p><p>Primili smo zahtev za resetovanje šifre za vaš nalog na PolovniSatovi.</p><p style="margin-top: 20px;">Kliknite na dugme ispod da biste resetovali svoju šifru:</p><p style="margin-top: 20px;"><a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Resetuj šifru</a></p><p style="margin-top: 20px; color: #666; font-size: 14px;">Ili kopirajte i nalepite ovaj link u vaš browser:</p><p style="color: #666; font-size: 12px; word-break: break-all;">${resetUrl}</p><p style="margin-top: 30px; color: #666; font-size: 12px;"><strong>Napomena:</strong> Ovaj link će biti aktivan samo 1 sat. Ako niste zahtevali resetovanje šifre, ignorišite ovaj email.</p></div>`;

    return await sendBrevoEmail({
      to: [{ email: to, name }],
      subject: "Resetovanje šifre - PolovniSatovi",
      htmlContent,
      tags: ["password-reset"],
    });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return { success: false as const, error };
  }
}