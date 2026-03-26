import nodemailer from 'nodemailer';

const ADMIN_EMAIL = 'contact@tjb4nyc.com';

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port: parseInt(port),
    secure: parseInt(port) === 465,
    auth: { user, pass },
  });

  return transporter;
}

/**
 * Send an admin notification email. Fire-and-forget — logs errors but never throws.
 * If SMTP is not configured, logs to console instead.
 */
export function notifyAdmin(subject: string, body: string): void {
  const transport = getTransporter();

  if (!transport) {
    console.log(`[EMAIL-NOTIFY] (SMTP not configured) ${subject}: ${body}`);
    return;
  }

  transport.sendMail({
    from: process.env.SMTP_USER,
    to: ADMIN_EMAIL,
    subject,
    text: body,
  }).catch((err) => {
    console.error('[EMAIL-NOTIFY] Failed to send:', err.message);
  });
}
