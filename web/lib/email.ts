import "server-only";

import { Resend } from "resend";

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY environment variable is not set");
  }
  return new Resend(apiKey);
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
    const resend = getResend();
    const result = await resend.emails.send({
      from: "PolovniSatovi <noreply@polovnisatovi.com>",
      to,
      subject: `Nova poruka za vaÅ¡ oglas: ${listingTitle}`,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><h2>Nova poruka za vaÅ¡ oglas</h2><p>Dobili ste novu poruku za vaÅ¡ oglas: <strong>${listingTitle}</strong></p><div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;"><p><strong>Od:</strong> ${buyerName || buyerEmail}</p><p><strong>Email:</strong> ${buyerEmail}</p></div><div style="background-color: #ffffff; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;"><p>${message.replace(/\n/g, "<br>")}</p></div><p style="margin-top: 20px;"><a href="${process.env.NEXTAUTH_URL}/listing/${listingId}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Pogledaj oglas</a></p><p style="margin-top: 20px; color: #666; font-size: 12px;">MoÅ¾ete odgovoriti direktno na ovaj email da kontaktirate kupca.</p></div>`,
      replyTo: buyerEmail,
    });
    return { success: true, id: result.data?.id };
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
    const resend = getResend();
    const isApproved = status === "APPROVED";
    const subject = isApproved ? `VaÅ¡ oglas je odobren: ${listingTitle}` : `VaÅ¡ oglas je odbijen: ${listingTitle}`;
    const result = await resend.emails.send({
      from: "PolovniSatovi <noreply@polovnisatovi.com>",
      to,
      subject,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><h2>${isApproved ? "Oglas odobren" : "Oglas odbijen"}</h2><p>VaÅ¡ oglas <strong>${listingTitle}</strong> je ${isApproved ? "odobren" : "odbijen"}.</p>${reason && !isApproved ? `<div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;"><p><strong>Razlog:</strong></p><p>${reason}</p></div>` : ""}${isApproved ? `<p style="margin-top: 20px;"><a href="${process.env.NEXTAUTH_URL}/dashboard/listings" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Upravljaj oglasima</a></p>` : `<p style="margin-top: 20px;"><a href="${process.env.NEXTAUTH_URL}/dashboard/listings" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Pregledaj oglase</a></p>`}</div>`,
    });
    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error("Error sending status email:", error);
    return { success: false, error };
  }
}

export async function sendWelcomeEmail({ to, name }: { to: string; name?: string }) {
  try {
    const resend = getResend();
    const result = await resend.emails.send({
      from: "PolovniSatovi <noreply@polovnisatovi.com>",
      to,
      subject: "DobrodoÅ¡li na PolovniSatovi",
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><h2>DobrodoÅ¡li na PolovniSatovi!</h2><p>Hvala vam Å¡to ste se registrovali, ${name || ""}!</p><p>MoÅ¾ete poÄeti da:</p><ul><li>PretraÅ¾ujete oglase za polovne i vintage satove</li><li>Kontaktirate prodavce</li><li>Kreirate oglase i prodajete svoje satove</li></ul><p style="margin-top: 20px;"><a href="${process.env.NEXTAUTH_URL}/listings" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Pregledaj oglase</a></p></div>`,
    });
    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return { success: false, error };
  }
}

export async function sendPasswordResetEmail({ to, name, resetToken }: { to: string; name?: string; resetToken: string }) {
  try {
    const resend = getResend();
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;
    const result = await resend.emails.send({
      from: "PolovniSatovi <noreply@polovnisatovi.com>",
      to,
      subject: "Resetovanje Å¡ifre - PolovniSatovi",
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><h2>Resetovanje Å¡ifre</h2><p>Zdravo ${name || ""},</p><p>Primili smo zahtev za resetovanje Å¡ifre za vaÅ¡ nalog na PolovniSatovi.</p><p style="margin-top: 20px;">Kliknite na dugme ispod da biste resetovali svoju Å¡ifru:</p><p style="margin-top: 20px;"><a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Resetuj Å¡ifru</a></p><p style="margin-top: 20px; color: #666; font-size: 14px;">Ili kopirajte i nalepite ovaj link u vaÅ¡ browser:</p><p style="color: #666; font-size: 12px; word-break: break-all;">${resetUrl}</p><p style="margin-top: 30px; color: #666; font-size: 12px;"><strong>Napomena:</strong> Ovaj link Ä‡e biti aktivan samo 1 sat. Ako niste zahtevali resetovanje Å¡ifre, ignoriÅ¡ite ovaj email.</p></div>`,
    });
    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return { success: false, error };
  }
}