// ============================================================
// Supabase Edge Function: paypal-capture-order
//
// Called after the customer approves payment in the PayPal popup.
// Captures the payment server-side (the actual money-moving step),
// then writes the order record — same pattern as the Stripe webhook,
// so an order only ever gets created after payment truly succeeds.
//
// Deploy via Supabase Dashboard → Edge Functions → New Function
// (name it exactly "paypal-capture-order"), paste this in, Deploy.
//
// Needs these secrets set first (Dashboard → Edge Functions →
// Manage secrets): PAYPAL_CLIENT_ID, PAYPAL_SECRET,
// SUPABASE_SERVICE_ROLE_KEY (same ones used elsewhere)
// ============================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function getAccessToken() {
  const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
  const secret = Deno.env.get("PAYPAL_SECRET");
  const auth = btoa(`${clientId}:${secret}`);

  const res = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || "PayPal auth failed");
  return data.access_token;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { orderID, items, email, phone, user_id } = await req.json();
    if (!orderID) {
      return new Response(JSON.stringify({ error: "Missing orderID" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const accessToken = await getAccessToken();

    const captureRes = await fetch(
      `https://api-m.paypal.com/v2/checkout/orders/${orderID}/capture`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    const capture = await captureRes.json();

    if (!captureRes.ok || capture.status !== "COMPLETED") {
      return new Response(JSON.stringify({ error: "Payment not completed", details: capture }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const total = Number(
      capture.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value || 0,
    );

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL"),
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
    );

    const { data: orderRow, error } = await supabase
      .from("orders")
      .insert({
        user_id: user_id || null,
        contact_email: email,
        contact_phone: phone || null,
        items: items || [],
        total,
        payment_method: "paypal",
        status: "ordered",
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to insert order:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, order: orderRow }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
