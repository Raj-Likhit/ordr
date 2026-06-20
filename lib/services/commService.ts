import { createClient } from '@supabase/supabase-js';
import { COMM_TEMPLATES } from '../utils/templates';

// For internal server actions we need a service role client to bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Initialize inside functions or lazy load to avoid issues if env is missing
const getSupabase = () => createClient(supabaseUrl, supabaseKey);

interface CommPayload {
  eventId: keyof typeof COMM_TEMPLATES;
  subOrderId: string;
  recipientId?: string; // Auth User ID if buyer, or Vendor Profile ID
  email?: string;
  phone_wa?: string;
}

export async function dispatchCommunication(payload: CommPayload) {
  const supabase = getSupabase();
  const template = COMM_TEMPLATES[payload.eventId];

  if (!template) {
    console.error(`Unknown comm event: ${payload.eventId}`);
    return;
  }

  const logs = [];

  // 1. Send Email (Mocked or real if RESEND_API_KEY is present)
  if (payload.email) {
    const subject = template.emailSubject(payload.subOrderId.slice(0, 8));
    let status = 'sent';
    let error = null;

    try {
      if (process.env.RESEND_API_KEY) {
        // Integrate with Resend
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'orders@yourdomain.com',
            to: payload.email,
            subject,
            html: `<p>${subject}</p>`
          })
        });
      } else {
        console.log(`[MOCK EMAIL] To: ${payload.email} | Subject: ${subject}`);
      }
    } catch (e: any) {
      status = 'failed';
      error = e.message;
    }

    logs.push({
      recipient_id: payload.recipientId,
      channel: 'email',
      event: payload.eventId,
      sub_order_id: payload.subOrderId,
      status,
      error
    });
  }

  // 2. Send WhatsApp (Mocked or real if WA_TOKEN is present)
  if (payload.phone_wa) {
    let status = 'sent';
    let error = null;

    try {
      if (process.env.WA_TOKEN && process.env.WA_PHONE_NUMBER_ID) {
        const phoneId = process.env.WA_PHONE_NUMBER_ID;
        await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.WA_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: payload.phone_wa,
            type: 'template',
            template: { name: template.waTemplate, language: { code: 'en_US' } }
          })
        });
      } else {
        console.log(`[MOCK WHATSAPP] To: ${payload.phone_wa} | Template: ${template.waTemplate}`);
      }
    } catch (e: any) {
      status = 'failed';
      error = e.message;
    }

    logs.push({
      recipient_id: payload.recipientId,
      channel: 'whatsapp',
      event: payload.eventId,
      sub_order_id: payload.subOrderId,
      status,
      error
    });
  }

  // 3. Log to notification_log (serves as comm_log)
  if (logs.length > 0) {
    // Only insert valid logs that match the schema
    const { error: logError } = await supabase.from('notification_log').insert(
      logs.map(log => ({
        recipient_id: log.recipient_id,
        channel: log.channel,
        event: log.event,
        sub_order_id: log.sub_order_id,
        status: log.status
        // Note: the notification_log schema we queried doesn't have an 'error' column.
        // We just omit it to avoid schema insertion errors.
      }))
    );
    if (logError) {
      console.error('Failed to write to notification_log', logError);
    }
  }
}
