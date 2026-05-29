import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

/**
 * Lazily-initialized Resend client.
 * If the API key is missing (e.g. local dev without setup), we no-op
 * and log instead of crashing the server.
 */
let _client: Resend | null = null;

function getClient(): Resend | null {
  if (!apiKey) return null;
  if (!_client) _client = new Resend(apiKey);
  return _client;
}

export type EmailPayload = {
  to: string | string[];
  subject: string;
  /** Pre-rendered HTML body (e.g. from React Email render()). */
  html: string;
  /** Optional plaintext fallback. */
  text?: string;
  /** Optional reply-to override. */
  replyTo?: string;
};

const DEFAULT_FROM = process.env.EMAIL_FROM || "JayField <noreply@jayfield.com>";

/**
 * Send a transactional email via Resend.
 * Returns `{ ok: true, id }` on success, `{ ok: false, error }` on failure.
 * Never throws — callers can fire-and-forget.
 */
export async function sendEmail(payload: EmailPayload): Promise<
  | { ok: true; id: string }
  | { ok: false; error: string; skipped?: boolean }
> {
  const client = getClient();
  if (!client) {
    console.warn(
      "[email] RESEND_API_KEY not set — skipping email to",
      payload.to
    );
    return { ok: false, error: "RESEND_API_KEY not configured", skipped: true };
  }

  try {
    const result = await client.emails.send({
      from: DEFAULT_FROM,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      replyTo: payload.replyTo,
    });
    if (result.error) {
      console.error("[email] Resend error:", result.error);
      return { ok: false, error: result.error.message };
    }
    return { ok: true, id: result.data?.id ?? "" };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[email] Send failed:", msg);
    return { ok: false, error: msg };
  }
}
