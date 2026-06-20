import { Resend } from 'resend';

// ─────────────────────────────────────────────────────────────────────────────
// lib/notify.ts — Shared notification helpers
// Used from order-status transitions, checkout webhooks, etc.
// ─────────────────────────────────────────────────────────────────────────────

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');
const FROM = process.env.RESEND_FROM_EMAIL ?? 'orders@ordr.in';

// ── Email ─────────────────────────────────────────────────────────────────────

export interface EmailPayload {
  to: string | string[];
  subject: string;
  react?: React.ReactElement;
  html?: string;
  text?: string;
}

export async function sendEmail(payload: EmailPayload) {
  try {
    const { data, error } = await resend.emails.send({
      from: `Ordr <${FROM}>`,
      ...payload,
    } as any);
    if (error) {
      console.error('[notify:sendEmail] Resend error:', error);
      return { success: false, error };
    }
    return { success: true, id: data?.id };
  } catch (err) {
    console.error('[notify:sendEmail] Unexpected:', err);
    return { success: false, error: err };
  }
}

// ── Telegram ──────────────────────────────────────────────────────────────────
// Requires TELEGRAM_BOT_TOKEN env var.
// chatId comes from the user's profile or a stored mapping.

export async function sendTelegram(chatId: string, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.warn('[notify:sendTelegram] TELEGRAM_BOT_TOKEN not set — skipping');
    return { success: false };
  }
  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
    });
    const json = await res.json();
    if (!json.ok) {
      console.error('[notify:sendTelegram] Telegram error:', json);
      return { success: false, error: json };
    }
    return { success: true };
  } catch (err) {
    console.error('[notify:sendTelegram] Unexpected:', err);
    return { success: false, error: err };
  }
}

// ── Convenience: order status changed notification ────────────────────────────

export async function notifyOrderStatusChanged({
  buyerEmail,
  buyerTelegramId,
  orderId,
  subOrderId,
  vendorName,
  newStatus,
  trackingId,
}: {
  buyerEmail: string;
  buyerTelegramId?: string;
  orderId: string;
  subOrderId: string;
  vendorName: string;
  newStatus: string;
  trackingId?: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://ordr.in';
  const orderUrl = `${appUrl}/account/orders/${orderId}`;
  const shortId = orderId.slice(0, 8).toUpperCase();
  const statusLabel = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);

  const emailSubject = `Your Ordr order #${shortId} is now ${statusLabel}`;
  const bodyLines = [
    `Hi there!`,
    ``,
    `Great news — your order from **${vendorName}** (Ordr Order #${shortId}) has been updated to: **${statusLabel}**.`,
    trackingId ? `Tracking ID: \`${trackingId}\`` : '',
    ``,
    `View your order: ${orderUrl}`,
    ``,
    `— The Ordr Team`,
  ]
    .filter((l) => l !== undefined)
    .join('\n');

  const htmlBody = `
    <div style="font-family:'DM Sans',Arial,sans-serif;color:#1C1917;max-width:560px;margin:0 auto;padding:32px 24px;">
      <p style="font-family:'Cormorant',Georgia,serif;font-size:28px;font-weight:600;margin-bottom:16px;">ORDR</p>
      <h2 style="font-size:20px;margin-bottom:12px;">Order ${statusLabel}</h2>
      <p>Your order from <strong>${vendorName}</strong> (#{shortId}) is now <strong>${statusLabel}</strong>.</p>
      ${trackingId ? `<p>Tracking ID: <code>${trackingId}</code></p>` : ''}
      <a href="${orderUrl}" style="display:inline-block;margin-top:20px;background:#C84B0F;color:#fff;padding:12px 28px;border-radius:4px;text-decoration:none;font-weight:700;">Track Order</a>
    </div>
  `;

  // Email
  await sendEmail({
    to: buyerEmail,
    subject: emailSubject,
    html: htmlBody,
    text: bodyLines,
  });

  // Telegram (if chat ID available)
  if (buyerTelegramId) {
    await sendTelegram(
      buyerTelegramId,
      `🛍 *Ordr Order Update*\n\nYour order #${shortId} from *${vendorName}* is now *${statusLabel}*.${trackingId ? `\nTracking: \`${trackingId}\`` : ''}\n\n[View Order](${orderUrl})`
    );
  }
}
