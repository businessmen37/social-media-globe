// ============================================================
// Social Media Globe — site behavior
// Shared config (Supabase, PayPal, WhatsApp, socials) lives in
// supabase-app.js, loaded before this file.
// ============================================================

// Apply WhatsApp number + social links to every matching element.
document.querySelectorAll('a[href*="wa.me/1XXXXXXXXXX"]').forEach(a => {
  a.href = a.href.replace("1XXXXXXXXXX", WHATSAPP_NUMBER);
});
document.getElementById("social-facebook")?.setAttribute("href", SOCIAL_LINKS.facebook);
document.getElementById("social-instagram")?.setAttribute("href", SOCIAL_LINKS.instagram);
document.getElementById("social-youtube")?.setAttribute("href", SOCIAL_LINKS.youtube);
document.getElementById("social-tiktok")?.setAttribute("href", SOCIAL_LINKS.tiktok);
const footerWaEl = document.getElementById("footer-wa-number");
if (footerWaEl) footerWaEl.textContent = "+" + WHATSAPP_NUMBER;

// Footer year
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ------------------------------------------------------------
// Signature "live feed" — illustrative activity entries that
// dramatize the site's real differentiator: a real team doing
// real work across real places, not an automated panel.
// Purely decorative/illustrative — not connected to live data.
// ------------------------------------------------------------
const cities = [
  "Lagos, NG", "Manila, PH", "São Paulo, BR", "Nairobi, KE",
  "Jakarta, ID", "Port-au-Prince, HT", "Mexico City, MX",
  "Accra, GH", "Ho Chi Minh City, VN", "Cairo, EG"
];

const actions = [
  { msg: "watch-hours logged", unit: "min", min: 15, max: 90 },
  { msg: "TikTok videos watched", unit: "videos", min: 3, max: 20 },
  { msg: "YouTube subscribers gained", unit: "subs", min: 5, max: 40 },
  { msg: "Facebook minutes viewed", unit: "min", min: 50, max: 400 },
  { msg: "Instagram followers gained", unit: "followers", min: 5, max: 30 },
  { msg: "TikTok followers gained", unit: "followers", min: 10, max: 60 }
];

function randomFrom(arr){ return arr[Math.floor(Math.random() * arr.length)]; }
function randomInt(min, max){ return Math.floor(Math.random() * (max - min + 1)) + min; }

function minutesAgoLabel(n){
  if (n < 1) return "just now";
  if (n === 1) return "1 min ago";
  return `${n} min ago`;
}

function buildRow(minsAgo){
  const city = randomFrom(cities);
  const action = randomFrom(actions);
  const amount = randomInt(action.min, action.max);
  const row = document.createElement("div");
  row.className = "feed-row";
  row.innerHTML = `
    <span class="t">${minutesAgoLabel(minsAgo)}</span>
    <span class="msg"><b>${amount} ${action.unit}</b> ${action.msg}</span>
    <span class="loc">${city}</span>
  `;
  return row;
}

const feedList = document.getElementById("feed-list");
if (feedList) {
  let minsAgo = 0;
  for (let i = 0; i < 9; i++) {
    minsAgo += randomInt(1, 6);
    feedList.appendChild(buildRow(minsAgo));
  }
  setInterval(() => {
    feedList.prepend(buildRow(0));
    if (feedList.children.length > 14) {
      feedList.removeChild(feedList.lastElementChild);
    }
  }, 5000);
}

// ============================================================
// Shopping cart — items persist in this browser (localStorage)
// until checkout. Checking out (PayPal or Stripe) requires being
// signed in, since every order needs to be attached to an account.
// ============================================================
const CART_KEY = "smg-cart-v1";

function loadCart(){
  try{
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : {};
  }catch(e){
    return {};
  }
}
function saveCart(cart){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); }

let cart = loadCart();

function formatMoney(n){
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}
function cartCount(){ return Object.values(cart).reduce((s, i) => s + i.qty, 0); }
function cartTotal(){ return Object.values(cart).reduce((s, i) => s + i.qty * i.price, 0); }

function addToCart(id, name, price){
  if (cart[id]) cart[id].qty += 1;
  else cart[id] = { name, price, qty: 1 };
  saveCart(cart);
  renderCart();
}
function changeQty(id, delta){
  if (!cart[id]) return;
  cart[id].qty += delta;
  if (cart[id].qty <= 0) delete cart[id];
  saveCart(cart);
  renderCart();
}
function removeFromCart(id){
  delete cart[id];
  saveCart(cart);
  renderCart();
}
function clearCart(){
  cart = {};
  saveCart(cart);
  renderCart();
}

function cartItemsArray(){
  return Object.values(cart).map(i => ({ name: i.name, price: i.price, qty: i.qty }));
}

function buildOrderSummaryText(){
  const lines = Object.values(cart).map(item => `• ${item.name} x${item.qty}: ${formatMoney(item.price * item.qty)}`);
  lines.push("", `Total: ${formatMoney(cartTotal())}`);
  return lines.join("\n");
}

function renderCart(){
  const countEl = document.getElementById("cart-count");
  const itemsEl = document.getElementById("cart-items");
  const footerEl = document.getElementById("cart-footer");
  const totalEl = document.getElementById("cart-total");
  if (!countEl || !itemsEl) return;

  const ids = Object.keys(cart);
  countEl.textContent = cartCount();

  document.querySelectorAll(".add-cart").forEach(btn => {
    const id = btn.dataset.id;
    if (cart[id]) {
      btn.textContent = `In cart (${cart[id].qty}), add another`;
      btn.classList.add("in-cart");
    } else {
      btn.textContent = "Add to cart";
      btn.classList.remove("in-cart");
    }
  });

  if (ids.length === 0) {
    itemsEl.innerHTML = `<p class="cart-empty" id="cart-empty">Your cart is empty. Add a service to get started.</p>`;
    footerEl.hidden = true;
    return;
  }

  itemsEl.innerHTML = "";
  ids.forEach(id => {
    const item = cart[id];
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <div>
        <div class="ci-name">${item.name}</div>
        <div class="qty-stepper">
          <button type="button" data-action="dec" data-id="${id}">−</button>
          <span>${item.qty}</span>
          <button type="button" data-action="inc" data-id="${id}">+</button>
        </div>
      </div>
      <div class="ci-right">
        <span class="ci-price">${formatMoney(item.price * item.qty)}</span>
        <button type="button" class="ci-remove" data-action="remove" data-id="${id}">Remove</button>
      </div>
    `;
    itemsEl.appendChild(row);
  });

  footerEl.hidden = false;
  totalEl.textContent = formatMoney(cartTotal());

  const paypalReminder = document.getElementById("paypal-total-reminder");
  if (paypalReminder) paypalReminder.textContent = formatMoney(cartTotal());
  if (typeof updatePaypalLinks === "function") updatePaypalLinks();

  refreshCheckoutAuthState();
}

// Add-to-cart + qty controls (event delegation)
document.addEventListener("click", (e) => {
  const addBtn = e.target.closest(".add-cart");
  if (addBtn) {
    addToCart(addBtn.dataset.id, addBtn.dataset.name, parseFloat(addBtn.dataset.price));
    openCart();
    return;
  }
  const qtyBtn = e.target.closest("[data-action]");
  if (qtyBtn) {
    const { action, id } = qtyBtn.dataset;
    if (action === "inc") changeQty(id, 1);
    if (action === "dec") changeQty(id, -1);
    if (action === "remove") removeFromCart(id);
  }
});

// Drawer open/close
const cartDrawer = document.getElementById("cart-drawer");
const cartOverlay = document.getElementById("cart-overlay");
function openCart(){
  if (!cartDrawer) return;
  cartDrawer.classList.add("open");
  cartOverlay.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
}
function closeCart(){
  if (!cartDrawer) return;
  cartDrawer.classList.remove("open");
  cartOverlay.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
}
document.getElementById("cart-open")?.addEventListener("click", openCart);
document.getElementById("contact-open-cart")?.addEventListener("click", openCart);
document.getElementById("cart-close")?.addEventListener("click", closeCart);
cartOverlay?.addEventListener("click", closeCart);

// WhatsApp order message (always available, no login needed)
document.getElementById("cart-pay-whatsapp")?.addEventListener("click", (e) => {
  e.preventDefault();
  const text = encodeURIComponent(`Hi Social Media Globe, I'd like to order:\n\n${buildOrderSummaryText()}`);
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank", "noopener");
});

// ============================================================
// Auth modal (sign in / create account) — used from the cart,
// but also reachable directly on account.html.
// ============================================================
const authOverlay = document.getElementById("auth-overlay");
const authModal = document.getElementById("auth-modal");

function openAuth(){
  if (!authModal) return;
  authModal.classList.add("open");
  authOverlay.classList.add("open");
  authModal.setAttribute("aria-hidden", "false");
}
function closeAuth(){
  if (!authModal) return;
  authModal.classList.remove("open");
  authOverlay.classList.remove("open");
  authModal.setAttribute("aria-hidden", "true");
}
document.getElementById("cart-open-auth")?.addEventListener("click", openAuth);
document.getElementById("auth-close")?.addEventListener("click", closeAuth);
authOverlay?.addEventListener("click", closeAuth);

document.querySelectorAll(".auth-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".auth-tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    const isSignin = tab.dataset.tab === "signin";
    document.getElementById("auth-form-signin").hidden = !isSignin;
    document.getElementById("auth-form-signup").hidden = isSignin;
  });
});

document.getElementById("auth-form-signin")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("signin-email").value;
  const password = document.getElementById("signin-password").value;
  const errEl = document.getElementById("signin-error");
  errEl.textContent = "";
  const { error } = await smgSignIn(email, password);
  if (error) { errEl.textContent = error.message; return; }
  closeAuth();
  refreshCheckoutAuthState();
});

document.getElementById("auth-form-signup")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("signup-email").value;
  const phone = document.getElementById("signup-phone").value;
  const password = document.getElementById("signup-password").value;
  const errEl = document.getElementById("signup-error");
  const okEl = document.getElementById("signup-success");
  errEl.textContent = "";
  okEl.hidden = true;
  const { error } = await smgSignUp(email, password, phone);
  if (error) { errEl.textContent = error.message; return; }
  okEl.hidden = false;
});

// Show either "please sign in" or the real checkout buttons in the
// cart, depending on whether someone's actually logged in.
async function refreshCheckoutAuthState(){
  const authRequiredEl = document.getElementById("cart-auth-required");
  const checkoutOptionsEl = document.getElementById("cart-checkout-options");
  if (!authRequiredEl || !checkoutOptionsEl) return;

  const session = await smgGetSession();
  if (session) {
    authRequiredEl.hidden = true;
    checkoutOptionsEl.hidden = false;
  } else {
    authRequiredEl.hidden = false;
    checkoutOptionsEl.hidden = true;
  }
}

// ============================================================
// PayPal / Card checkout — your account isn't yet approved for
// PayPal's automatic "Checkout" API, so both buttons open your
// working Payment Link (which itself offers PayPal balance, cards,
// and Apple Pay once there). Clicking either one also logs the
// order right away, so nothing extra is needed after paying.
// ============================================================

async function logPaypalStyleOrder(){
  const session = await smgGetSession();
  if (!session || Object.keys(cart).length === 0) return;

  const { data, error } = await sb.from("orders").insert({
    user_id: session.user.id,
    contact_email: session.user.email,
    contact_phone: session.user.user_metadata?.phone || "",
    items: cartItemsArray(),
    total: cartTotal(),
    payment_method: "paypal",
    status: "ordered",
  }).select().single();

  if (error) {
    console.error(error);
    return;
  }

  clearCart();
  closeCart();
  alert(`Your order ${data.order_number} has been logged. We'll confirm your payment and update the status in "My Account" — sending it via WhatsApp too helps us start faster.`);
}

// Builds a PayPal link with the cart total already filled in, using
// PayPal's classic "Buy Now" redirect format — this is the one
// PayPal's own documentation confirms supports a pre-set amount via
// URL, unlike the newer Payment Links product we were using before.
function buildPaypalAmountUrl(){
  const itemNames = Object.values(cart).map(i => `${i.qty}x ${i.name}`).join(", ").slice(0, 120);
  const params = new URLSearchParams({
    cmd: "_xclick",
    business: "business@goldlifefitness.com",
    item_name: itemNames || "Social Media Globe order",
    amount: cartTotal().toFixed(2),
    currency_code: "USD",
    no_shipping: "1",
  });
  return `https://www.paypal.com/cgi-bin/webscr?${params.toString()}`;
}

function updatePaypalLinks(){
  const url = buildPaypalAmountUrl();
  const paypalLink = document.getElementById("cart-pay-paypal-link");
  const cardLink = document.getElementById("cart-pay-card-link");
  if (paypalLink) paypalLink.href = url;
  if (cardLink) cardLink.href = url;
}

document.getElementById("cart-pay-paypal-link")?.addEventListener("click", () => {
  updatePaypalLinks();
  logPaypalStyleOrder();
});
document.getElementById("cart-pay-card-link")?.addEventListener("click", () => {
  updatePaypalLinks();
  logPaypalStyleOrder();
});

// ============================================================
// Stripe checkout — calls the create-checkout-session Edge
// Function to build one dynamic multi-item session, then
// redirects to Stripe's hosted checkout page.
// ============================================================
document.getElementById("cart-pay-stripe")?.addEventListener("click", async () => {
  const session = await smgGetSession();
  if (!session) { openAuth(); return; }

  const btn = document.getElementById("cart-pay-stripe");
  btn.disabled = true;
  btn.textContent = "Redirecting to Stripe…";

  try {
    const res = await fetch(`${FUNCTIONS_URL}/create-checkout-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        items: cartItemsArray(),
        email: session.user.email,
        phone: session.user.user_metadata?.phone || "",
        user_id: session.user.id,
        site_url: window.location.origin,
      }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      throw new Error(data.error || "Could not start Stripe checkout");
    }
  } catch (err) {
    alert("Stripe checkout couldn't start. Please try again, or use WhatsApp to complete your order.");
    console.error(err);
    btn.disabled = false;
    btn.textContent = "Pay with Stripe";
  }
});

// If we've just come back from a Stripe redirect, let the customer
// know their order is being finalized (the webhook writes the actual
// row, which can take a few seconds).
const params = new URLSearchParams(window.location.search);
if (params.get("checkout") === "success") {
  clearCart();
  alert("Payment received! Your order is being confirmed and will appear in \"My Account\" shortly.");
}
if (params.get("checkout") === "cancel") {
  alert("Checkout was canceled. Your cart is still saved, nothing was charged.");
}

renderCart();
refreshCheckoutAuthState();

// Mobile nav toggle
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.style.display === "flex";
    navLinks.style.display = isOpen ? "none" : "flex";
    navLinks.style.flexDirection = "column";
    navLinks.style.position = "absolute";
    navLinks.style.top = "64px";
    navLinks.style.left = "0";
    navLinks.style.right = "0";
    navLinks.style.background = "#0B1220";
    navLinks.style.padding = "16px 24px";
    navLinks.style.borderBottom = "1px solid #26314A";
    navLinks.style.gap = "16px";
  });
}
