—import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const RECIPIENT_EMAILS = Deno.env.get("CONTACT_RECIPIENT_EMAILS")?.split(",").map(e => e.trim()).filter(Boolean) ?? [];

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().trim().email("Invalid email").max(255, "Email too long"),
  subject: z.string().trim().min(1, "Subject is required").max(200, "Subject too long"),
  message: z.string().trim().min(1, "Message is required").max(5000, "Message too long"),
});
/** Escape HTML special chars to prevent XSS when inserting user input into email body. */
function escapeHtml(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
}


Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const raw = await req.json();
    const parsed = contactSchema.safeParse(raw);

    if (!parsed.success) {
      return new Response(JSON.stringify({
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { name, email, subject, message } = parsed.data;

    // Store in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: dbError } = await supabase
      .from("contact_messages")
      .insert({ name, email, subject, message });

    if (dbError) {
      console.error("DB insert error:", dbError);
      return new Response(JSON.stringify({ error: "Failed to save message" }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Send email notification via Resend
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey) {
            // Escape user input before inserting into HTML email body to prevent XSS
            const safeName = escapeHtml(name);
            const safeEmail = escapeHtml(email);
            const safeSubject = escapeHtml(subject);
            const safeMessage = escapeHtml(message);
      try {
        const resendUrl = "https://api.resend.com/emails";
        const emailBody = {
          from: "Access Michigan <onboarding@resend.dev>",
          to: RECIPIENT_EMAILS,
                    subject: `Contact Form: ${safeSubject}`,
          html: `
            <h2>New Contact Message</h2>
            <table style="border-collapse:collapse;width:100%;font-family:sans-serif;font-size:14px">
                            <tr><td style="padding:6px;border-bottom:1px solid #eee;font-weight:bold">From</td><td style="padding:6px;border-bottom:1px solid #eee">${safeName}</td></tr>
                            <tr><td style="padding:6px;border-bottom:1px solid #eee;font-weight:bold">Email</td><td style="padding:6px;border-bottom:1px solid #eee">${safeEmail}</td></tr>
                            <tr><td style="padding:6px;border-bottom:1px solid #eee;font-weight:bold">Subject</td><td style="padding:6px;border-bottom:1px solid #eee">${safeSubject}</td></tr>
                            <tr><td style="padding:6px;border-bottom:1px solid #eee;font-weight:bold">Message</td><td style="padding:6px;border-bottom:1px solid #eee">${safeMessage}</td></tr>
            </table>
            <p style="margin-top:16px;font-size:12px;color:#888">Sent via Access Michigan contact form.</p>
          `,
        };

        const emailRes = await fetch(resendUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendKey}`,
          },
          body: JSON.stringify(emailBody),
        });

        if (emailRes.ok) {
                    console.log("Contact email notification sent successfully");
        } else {
                    console.error("Resend API error status:", emailRes.status);
        }
      } catch (emailErr) {
        console.error("Email send failed:", emailErr);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
