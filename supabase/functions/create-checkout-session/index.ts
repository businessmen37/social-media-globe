// ============================================================
// Supabase Edge Function: create-checkout-session
//
// Takes the customer's cart (any mix of the 14 services, any
// quantities) and creates ONE Stripe Checkout Session for the
// whole order — this is what makes a real multi-item cart work
// with Stripe, instead of needing 14 separate fixed links.
//
// Deploy via Supabase Dashboard → Edge Functions → New Function
// (name it exactly "create-checkout-session"), paste this file's
// contents in, and Deploy. No local coding/CLI required.
//
// Needs one secret set first (Dashboard → Edge Functions →
// Manage secrets): STRIPE_SECRET_KEY
// ============================================================

import Stripe from "https://esm.sh/stripe@14?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { items, email, phone, user_id, site_url } = await req.json();

    if (!Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: "Cart is empty" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"), {
      apiVersion: "2024-06-20",
      httpClient: Stripe.createFetchHttpClient(),
    });

    const line_items = items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: { name: item.name },
        unit_amount: Math.round(Number(item.price) * 100),
      },
      quantity: Number(item.qty) || 1,
    }));

    const origin = site_url || "https://socialmediaglobe.net";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      customer_email: email,
      success_url: `${origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?checkout=cancel`,
      metadata: {
        user_id: user_id || "",
        phone: phone || "",
        items: JSON.stringify(items),
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
