import nodemailer, { Transporter } from "nodemailer";

const EMAIL_HOST = process.env.EMAIL_HOST;
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || "587", 10);
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const EMAIL_FROM = process.env.EMAIL_FROM || '"DocuCanvas" <noreply@docucanvas.com>';

let transporter: Transporter | null = null;

if (EMAIL_HOST && EMAIL_USER && EMAIL_PASSWORD) {
  transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: EMAIL_PORT === 465,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD,
    },
  });
}

export interface SendInvitationEmailParams {
  toEmail: string;
  documentTitle: string;
  invitedByName: string;
  role: "viewer" | "editor";
  inviteUrl: string;
  expiresInDays?: number;
}

export async function sendInvitationEmail({
  toEmail,
  documentTitle,
  invitedByName,
  role,
  inviteUrl,
  expiresInDays = 7,
}: SendInvitationEmailParams): Promise<{ success: boolean; error?: string }> {
  const roleLabel = role === "editor" ? "an Editor" : "a Viewer";

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
          .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
          .logo { font-size: 22px; font-weight: 800; color: #4f46e5; margin-bottom: 24px; display: flex; align-items: center; }
          h2 { margin: 0 0 16px; font-size: 20px; color: #0f172a; }
          p { margin: 0 0 16px; line-height: 1.6; color: #475569; font-size: 15px; }
          .doc-card { background: #f1f5f9; border-radius: 8px; padding: 16px; margin: 20px 0; border-left: 4px solid #4f46e5; }
          .btn { display: inline-block; background-color: #4f46e5; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; margin: 20px 0; }
          .footer { font-size: 12px; color: #94a3b8; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">📄 DocuCanvas</div>
          <h2>Document Invitation</h2>
          <p>Hello,</p>
          <p><strong>${invitedByName}</strong> has invited you to collaborate on a document as <strong>${roleLabel}</strong>.</p>
          <div class="doc-card">
            <strong>Document:</strong> ${documentTitle}
          </div>
          <p>Click the button below to accept the invitation and access the document:</p>
          <a href="${inviteUrl}" class="btn">Open Document</a>
          <p style="font-size: 13px; color: #64748b;">This invitation will expire in ${expiresInDays} days.</p>
          <div class="footer">
            If you were not expecting this invitation, you can safely ignore this email.<br>
            DocuCanvas — The modern Word template & document suite.
          </div>
        </div>
      </body>
    </html>
  `;

  if (!transporter) {
    console.log(
      `\n[EMAIL NOTICE: SMTP not configured. Invitation URL generated for ${toEmail}]:\n${inviteUrl}\n`
    );
    return { success: true };
  }

  try {
    await transporter.sendMail({
      from: EMAIL_FROM,
      to: toEmail,
      subject: `${invitedByName} invited you to collaborate on "${documentTitle}" — DocuCanvas`,
      html,
    });
    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to deliver email";
    console.error("Email delivery failed:", errorMsg);
    return { success: false, error: errorMsg };
  }
}
