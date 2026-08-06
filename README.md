# Social Media Globe — full website + backend

Everything for socialmediaglobe.net: the website itself (static
HTML/CSS/JS, free on GitHub Pages), a real shopping cart, customer
accounts with order history, an admin dashboard, and automatic order
creation for both PayPal and Stripe.

This reflects the FINAL, working setup as of this build — including the
proper server-side PayPal integration (not the deprecated client-side
one PayPal now blocks).

You will not write or edit any code. Every step below is either pasting
something into a dashboard, or clicking buttons.

---

## What's in this folder

```
index.html              - homepage (cart, pricing, services)
account.html             - customer login/signup + order history
admin.html                - admin order dashboard
policies.html              - Terms / Privacy / Refund policy
style.css, script.js, supabase-app.js   - the site's code
CNAME                     - tells GitHub Pages to use socialmediaglobe.net
logo/                      - your logo, favicon, and social media banners
supabase/schema.sql         - database setup (NOT uploaded to GitHub — see Part 1)
supabase/functions/          - 4 backend functions (NOT uploaded to GitHub — see Part 2)
```

**Only upload these to GitHub:** `index.html`, `account.html`, `admin.html`,
`policies.html`, `style.css`, `script.js`, `supabase-app.js`, `CNAME`, and
the `logo` folder. The `supabase` folder is used separately, directly in
your Supabase dashboard (Parts 1 and 2 below) — it never goes to GitHub.

---

## Part 1 — Supabase Database

1. Supabase project → **SQL Editor** → **New query**.
2. Copy everything from `supabase/schema.sql`, paste it in, click **Run**.
3. You should see "Success. No rows returned."

This creates your `profiles` and `orders` tables, auto order-numbering
(SMG0001, SMG0002...), and all the security rules.

---

## Part 2 — Supabase Edge Functions (4 total)

For each of these 4 functions: **Edge Functions → New function → Via
Editor**, clear the starter code, paste in the matching file below, name
it exactly as shown, click **Deploy**.

| File | Function name (exact) |
|---|---|
| `supabase/functions/create-checkout-session/index.ts` | `create-checkout-session` |
| `supabase/functions/stripe-webhook/index.ts` | `stripe-webhook` |
| `supabase/functions/paypal-create-order/index.ts` | `paypal-create-order` |
| `supabase/functions/paypal-capture-order/index.ts` | `paypal-capture-order` |

**Important:** for `stripe-webhook` only — after deploying, go to that
function's **Settings** tab and turn **OFF** "Verify JWT with legacy
secret," then Save. (The other 3 functions keep this ON — default.)

---

## Part 3 — Secrets

**Edge Functions → Secrets**, add these 4:

| Name | Value | Where to get it |
|---|---|---|
| `STRIPE_SECRET_KEY` | starts with `sk_` | Stripe Dashboard → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | starts with `whsec_` | See Part 4 below |
| `PAYPAL_CLIENT_ID` | starts with `BAA` | developer.paypal.com → Apps & Credentials → your "Social Media Globe" app |
| `PAYPAL_SECRET` | — | Same PayPal app page, "Secret key 1" (click the eye icon, then copy) |

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided automatically
by Supabase — you don't need to add those yourself.

**Never paste any secret value into a chat with anyone, including me.**
Always copy directly from where it's shown and paste directly into
Supabase.

---

## Part 4 — Stripe Webhook

1. Stripe Dashboard → **Developers** → **Webhooks** → **Add destination**.
2. Endpoint URL:
   ```
   https://hwqulriicsgsaaadggoi.supabase.co/functions/v1/stripe-webhook
   ```
3. Event to listen for: `checkout.session.completed`
4. After creating it, reveal the **Signing secret** (`whsec_...`), copy
   it, and paste it into `STRIPE_WEBHOOK_SECRET` in Part 3 above.

(PayPal doesn't need a separate webhook step — the capture function
handles order-writing directly.)

---

## Part 5 — Publish the website on GitHub Pages

1. Create a new **public** GitHub repository, e.g. `social-media-globe`.
2. Upload the website files listed at the top of this doc (not the
   `supabase` folder) to the repo root.
3. Repo → **Settings → Pages** → Source: **Deploy from a branch** →
   branch `main`, folder `/ (root)` → **Save**.
4. Your site will be live at `https://yourusername.github.io/repo-name`
   within a minute or two, and GitHub Pages will pick up the `CNAME`
   file automatically for the custom domain.

---

## Part 6 — Connect socialmediaglobe.net

At your domain's DNS settings, add:

**4 A records** (host `@` or blank):
```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

**1 CNAME record:** host `www` → `yourusername.github.io`

Then in GitHub → Settings → Pages → Custom domain → enter
`socialmediaglobe.net` → Save. DNS can take anywhere from 10 minutes to
a few hours to fully activate. Turn on **Enforce HTTPS** once it's ready.

---

## Part 7 — Fix the confirmation-email rate limit (recommended)

Supabase's default email sender only allows a few emails per hour. To
remove that limit and send from your own domain:

1. Sign up free at **resend.com**, add `socialmediaglobe.net` as a
   domain (their Squarespace integration auto-adds the DNS records).
2. Create an API key in Resend.
3. In Supabase: **Authentication → Emails → SMTP Settings → Enable
   custom SMTP**, and fill in:
   - Sender email: `no-reply@socialmediaglobe.net`
   - Sender name: `Social Media Globe`
   - Host: `smtp.resend.com`
   - Port: `587`
   - Username: `resend`
   - Password: your Resend API key
4. Save.
5. Also go to **Authentication → URL Configuration** and set:
   - Site URL: `https://socialmediaglobe.net`
   - Add Redirect URL: `https://socialmediaglobe.net/**`

Without step 5, confirmation email links will send people to
`localhost:3000` instead of your real site.

---

## Part 8 — Become the admin

1. On your live site, go to `/account.html` → **Create Account**.
2. Sign up with **info@socialmediaglobe.net** exactly — that email is
   automatically made admin by the database schema.
3. Confirm the email, sign in, and you'll see **"Open Admin
   Dashboard"** on your account page.

---

## How it all works (for your understanding — no action needed)

- Customers sign up (email required, phone optional) and add services
  to their cart.
- **PayPal**: your site asks your own backend to create the PayPal
  order (using your secret key, server-side — this is the current
  required method, PayPal blocks the old client-only approach), the
  customer approves it in the popup, then your backend captures the
  payment and writes the order. Only real, completed payments ever
  create an order.
- **Stripe**: customer is sent to Stripe's hosted checkout with their
  whole cart; the moment they pay, Stripe notifies your webhook, which
  writes the order.
- Every order gets an automatic number (`SMG0001`, `SMG0002`...) and
  starts as **Ordered**. You move it to **In Progress** / **Completed**
  from `/admin.html`.
- Customers see their own orders and status at `/account.html`.
- **WhatsApp** is always available in the cart as a manual backup —
  encourage customers to send it in addition to paying, not instead of.

## Editing things later

- WhatsApp number, PayPal client-id, social media links → top of
  `supabase-app.js`
- Prices/services → the `<table class="price-table">` blocks in
  `index.html`
- Policies text → `policies.html`
