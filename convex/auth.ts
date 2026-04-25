import { convexAuth } from "@convex-dev/auth/server";
import Resend from "@auth/core/providers/resend";

function magicLinkEmail(url: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Sign in to PostPod</title>
</head>
<body style="margin:0;padding:0;background:#000000;font-family:-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#000000;">
    <tr>
      <td align="center" style="padding:48px 20px 64px;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:520px;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:36px;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-right:10px;vertical-align:middle;">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="32" height="32" style="background:#FFD60A;border-radius:8px;text-align:center;vertical-align:middle;font-weight:900;font-size:15px;color:#000000;letter-spacing:-0.04em;">
                          P
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td style="vertical-align:middle;">
                    <span style="font-size:18px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">postpod</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#0d0d0d;border:1px solid #262626;border-radius:20px;padding:44px 40px;">

              <!-- Envelope icon -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom:28px;">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="60" height="60" style="background:rgba(255,214,10,0.1);border:1px solid rgba(255,214,10,0.22);border-radius:14px;text-align:center;vertical-align:middle;font-size:26px;">
                          ✉
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Headline -->
              <h1 style="margin:0 0 14px;font-size:26px;font-weight:700;color:#ffffff;letter-spacing:-0.03em;text-align:center;line-height:1.2;">
                Your magic link is ready
              </h1>

              <!-- Subtext -->
              <p style="margin:0 0 36px;font-size:15px;color:#a3a3a3;text-align:center;line-height:1.6;">
                Click the button below to sign in to PostPod and turn your episode into publish-ready assets.
              </p>

              <!-- CTA button -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom:36px;">
                    <a href="${url}"
                       style="display:inline-block;background:#FFD60A;color:#000000;font-size:15px;font-weight:700;text-decoration:none;padding:17px 36px;border-radius:12px;letter-spacing:-0.01em;line-height:1;">
                      Sign in to PostPod &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider + what PostPod does -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="border-top:1px solid #1a1a1a;padding-top:28px;">

                    <!-- Three feature pills -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" style="padding-bottom:20px;">
                          <table cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="padding:0 4px;">
                                <span style="display:inline-block;background:#131313;border:1px solid #262626;border-radius:999px;padding:5px 12px;font-size:11px;color:#a3a3a3;letter-spacing:0.02em;">
                                  🎙 Transcription
                                </span>
                              </td>
                              <td style="padding:0 4px;">
                                <span style="display:inline-block;background:#131313;border:1px solid #262626;border-radius:999px;padding:5px 12px;font-size:11px;color:#a3a3a3;letter-spacing:0.02em;">
                                  ✍ Episode titles
                                </span>
                              </td>
                              <td style="padding:0 4px;">
                                <span style="display:inline-block;background:#131313;border:1px solid #262626;border-radius:999px;padding:5px 12px;font-size:11px;color:#a3a3a3;letter-spacing:0.02em;">
                                  📋 Show notes
                                </span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Expiry note -->
                    <p style="margin:0;font-size:12px;color:#555555;text-align:center;line-height:1.6;">
                      This link expires in <span style="color:#a3a3a3;">10 minutes</span>. If you didn't request this, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:32px;">
              <p style="margin:0 0 6px;font-size:11px;color:#444444;text-transform:uppercase;letter-spacing:0.12em;">
                PostPod &nbsp;&middot;&nbsp; For podcast hosts
              </p>
              <p style="margin:0;font-size:11px;">
                <a href="https://postpodcast.in" style="color:#555555;text-decoration:none;">postpodcast.in</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY,
      from: "PostPod <noreply@postpodcast.in>",
      async sendVerificationRequest({ identifier: email, url }) {
        const apiKey = process.env.AUTH_RESEND_KEY;
        if (!apiKey) throw new Error("AUTH_RESEND_KEY is not configured");
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "PostPod <noreply@postpodcast.in>",
            to: [email],
            subject: "Sign in to PostPod",
            html: magicLinkEmail(url),
          }),
        });
        if (!res.ok) {
          const body = await res.text();
          throw new Error(`Resend error (${res.status}): ${body}`);
        }
      },
    }),
  ],
});
