import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.23.8";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const RECIPIENT_EMAILS = ["saeb@fulbrightmail.org", "saeb.ahsan@gmail.com"];

const submissionSchema = z.object({
  organization_name: z.string().trim().min(1).max(200),
  contact_name: z.string().trim().min(1).max(100),
  contact_email: z.string().trim().email().max(255),
  resource_type: z.string().trim().min(1).max(50),
  description: z.string().trim().min(10).max(2000),
  services_offered: z.array(z.string().max(100)).max(20).default([]),
  address: z.string().max(300).optional(),
  city: z.string().max(100).optional(),
  county: z.string().max(50).optional(),
  phone: z.string().max(20).optional(),
  website: z.string().url().max(500).optional().or(z.literal("")),
  is_free: z.boolean().default(false),
  walk_in_available: z.boolean().default(false),
  languages: z.array(z.string().max(50)).max(10).default(["English"]),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const raw = await req.json();
    const parsed = submissionSchema.safeParse(raw);

    if (!parsed.success) {
      return new Response(JSON.stringify({
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = parsed.data;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { error: dbError } = await supabase
      .from("resource_submissions")
      .insert({
        organization_name: data.organization_name,
        contact_name: data.contact_name,
        contact_email: data.contact_email,
        resource_type: data.resource_type,
        description: data.description,
        services_offered: data.services_offered,
        address: data.address || null,
        city: data.city || null,
        county: data.county || null,
        phone: data.phone || null,
        website: data.website || null,
        is_free: data.is_free,
        walk_in_available: data.walk_in_available,
        languages: data.languages,
      });

    if (dbError) {
      console.error("DB insert error:", dbError);
      return new Response(JSON.stringify({ error: "Failed to save submission" }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Send email notification via Resend
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey) {
      try {
        const resend = new Resend(resendKey);
        await resend.emails.send({
          from: "Access Michigan <onboarding@resend.dev>",
          to: RECIPIENT_EMAILS,
          subject: `New Resource Submission: ${data.organization_name}`,
          html: `
            <h2>New Resource Submission</h2>
            <table style="border-collapse:collapse;width:100%;font-family:sans-serif;font-size:14px">
              <tr><td style="padding:6px;border-bottom:1px solid #eee;font-weight:bold">Organization</td><td style="padding:6px;border-bottom:1px solid #eee">${data.organization_name}</td></tr>
              <tr><td style="padding:6px;border-bottom:1px solid #eee;font-weight:bold">Contact</td><td style="padding:6px;border-bottom:1px solid #eee">${data.contact_name} (${data.contact_email})</td></tr>
              <tr><td style="padding:6px;border-bottom:1px solid #eee;font-weight:bold">Type</td><td style="padding:6px;border-bottom:1px solid #eee">${data.resource_type}</td></tr>
              <tr><td style="padding:6px;border-bottom:1px solid #eee;font-weight:bold">County</td><td style="padding:6px;border-bottom:1px solid #eee">${data.county || "Not specified"}</td></tr>
              <tr><td style="padding:6px;border-bottom:1px solid #eee;font-weight:bold">City</td><td style="padding:6px;border-bottom:1px solid #eee">${data.city || "Not specified"}</td></tr>
              <tr><td style="padding:6px;border-bottom:1px solid #eee;font-weight:bold">Description</td><td style="padding:6px;border-bottom:1px solid #eee">${data.description}</td></tr>
              <tr><td style="padding:6px;border-bottom:1px solid #eee;font-weight:bold">Services</td><td style="padding:6px;border-bottom:1px solid #eee">${data.services_offered.join(", ") || "None listed"}</td></tr>
              <tr><td style="padding:6px;border-bottom:1px solid #eee;font-weight:bold">Free?</td><td style="padding:6px;border-bottom:1px solid #eee">${data.is_free ? "Yes" : "No"}</td></tr>
              <tr><td style="padding:6px;border-bottom:1px solid #eee;font-weight:bold">Walk-in?</td><td style="padding:6px;border-bottom:1px solid #eee">${data.walk_in_available ? "Yes" : "No"}</td></tr>
              ${data.phone ? `<tr><td style="padding:6px;border-bottom:1px solid #eee;font-weight:bold">Phone</td><td style="padding:6px;border-bottom:1px solid #eee">${data.phone}</td></tr>` : ""}
              ${data.website ? `<tr><td style="padding:6px;border-bottom:1px solid #eee;font-weight:bold">Website</td><td style="padding:6px;border-bottom:1px solid #eee">${data.website}</td></tr>` : ""}
            </table>
            <p style="margin-top:16px;font-size:12px;color:#888">Submitted via Access Michigan resource directory.</p>
          `,
        });
        console.log("Email notification sent for resource submission:", data.organization_name);
      } catch (emailErr) {
        console.error("Email send failed:", emailErr);
        // Don't fail the request if email fails
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
