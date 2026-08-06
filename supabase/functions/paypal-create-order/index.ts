// ============================================================
// Supabase Edge Function: paypal-create-order
//
// Creates a PayPal order server-side using your Client ID + Secret.
// This replaces the old client-side "actions.order.create()" call,
// which PayPal now blocks for new apps — this is the integration
// method they actually require.
//
// Deploy via Supabase Dashboard → Edge Functions → New Function
// (name it exactly "paypal-create-order"), paste this in, Deploy.
//
// Needs two secrets set first (Dashboard → Edge Functions →
// Manage secrets): PAYPAL_CLIENT_ID, PAYPAL_SECRET
// ============================================================

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
    const { total } = await req.json();
    if (!total || Number(total) <= 0) {
      return new Response(JSON.stringify({ error: "Invalid total" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const accessToken = await getAccessToken();

    const orderRes = await fetch("https://api-m.paypal.com/v2/checkout/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: Number(total).toFixed(2),
            },
          },
        ],
      }),
    });

    const order = await orderRes.json();
    if (!orderRes.ok) {
      return new Response(JSON.stringify({ error: order.message || "PayPal order creation failed", details: order }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ id: order.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
