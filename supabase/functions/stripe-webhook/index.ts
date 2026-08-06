// ============================================================
// Supabase Edge Function: stripe-webhook
//
// Stripe calls this automatically the moment a customer actually
// completes payment. This is what creates the order record and
// sets status to "Ordered" — nothing on the website itself can be
// faked or skipped, because this only fires from Stripe's own
// servers after money has moved.
//
// Deploy via Supabase Dashboard → Edge Functions → New Function
// (name it exactly "stripe-webhook"), paste this file's contents
// in, and Deploy.
//
// Needs three secrets set first (Dashboard → Edge Functions →
// Manage secrets):
//   STRIPE_SECRET_KEY          (same one as the other function)
//   STRIPE_WEBHOOK_SECRET      (from Stripe Dashboard, see README)
//   SUPABASE_SERVICE_ROLE_KEY  (Project Settings → API Keys)
// ============================================================

import Stripe from "https://esm.sh/stripe@14?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"), {
    apiVersion: "2024-06-20",
    httpClient: Stripe.createFetchHttpClient(),
  });

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get("STRIPE_WEBHOOK_SECRET"),
    );
  } catch (err) {
    return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL"),
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
    );

    const items = session.metadata?.items ? JSON.parse(session.metadata.items) : [];
    const userId = session.metadata?.user_id || null;
    const phone = session.metadata?.phone || null;

    const { error } = await supabase.from("orders").insert({
      user_id: userId,
      contact_email: session.customer_details?.email || session.customer_email,
      contact_phone: phone,
      items,
      total: (session.amount_total || 0) / 100,
      payment_method: "stripe",
      status: "ordered",
    });

    if (error) {
      console.error("Failed to insert order:", error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
