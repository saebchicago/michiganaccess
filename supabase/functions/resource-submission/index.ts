import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Log notification for admin
    console.log(`New resource submission from ${data.contact_name} (${data.contact_email}): ${data.organization_name} — ${data.resource_type} in ${data.county || 'unspecified'} county`);

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
