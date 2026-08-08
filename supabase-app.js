// ============================================================
// Social Media Globe — shared app config + auth helpers
// Loaded on every page, before the page's own script.
// ============================================================

// ---- Site-wide config -------------------------------------------------
// Supabase project URL + publishable key are safe to keep public —
// they're meant to be used from the browser (row-level security in
// the database is what actually protects the data).
const SUPABASE_URL = "https://hwqulriicsgsaaadggoi.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable__XfRIXdLv2sQzgECOBoUHw_Vrg-Oq9B";

// Your PayPal Checkout app client-id (safe to be public — it only
// identifies your app to PayPal, it can't move money by itself).
const PAYPAL_CLIENT_ID = "BAANv1UyB4QZI-U0HQ1CmigRI0buta8ahHsrOxqLmtf9fWcBJEC7X81E59W01iOjDdOvN9Qm5MhEDJH1Y8";

// Your WhatsApp number, already filled in.
const WHATSAPP_NUMBER = "16816000916";

// Your social media profile URLs — paste real links in when you have
// them, leave "#" to hide/skip one for now.
const SOCIAL_LINKS = {
  facebook: "https://www.facebook.com/people/Socialmediaglobe/61588999744707/",
  instagram: "https://www.instagram.com/socialmediaglobe1",
  youtube: "https://www.youtube.com/@socialmediaglobe",
  tiktok: "https://www.tiktok.com/@socialmediaglobe1",
};

// The Edge Function base URL (same project, different path).
const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;

// ---- Supabase client ----------------------------------------------------
// Loaded from the CDN script tag included on each page before this file.
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ---- Auth helpers ---------------------------------------------------
async function smgSignUp(email, password, phone) {
  return sb.auth.signUp({
    email,
    password,
    options: { data: { phone } },
  });
}

async function smgSignIn(email, password) {
  return sb.auth.signInWithPassword({ email, password });
}

async function smgSignOut() {
  return sb.auth.signOut();
}

async function smgGetSession() {
  const { data } = await sb.auth.getSession();
  return data.session;
}

async function smgGetProfile() {
  const session = await smgGetSession();
  if (!session) return null;
  const { data, error } = await sb
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();
  if (error) return null;
  return data;
}
