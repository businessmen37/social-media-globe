"use strict";
const toggle = document.querySelector(".menu-toggle");
const nav = document.querySelector("#navigation");
function closeMenu() {
  nav?.classList.remove("open");
  toggle?.setAttribute("aria-expanded", "false");
  toggle?.setAttribute("aria-label", "Louvri meni an");
}
toggle?.addEventListener("click", () => {
  const open = toggle.getAttribute("aria-expanded") !== "true";
  nav.classList.toggle("open", open);
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Fèmen meni an" : "Louvri meni an");
});
nav?.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
  }
});
const form = document.querySelector("#contact-form");
document.querySelectorAll("[data-service]").forEach((link) =>
  link.addEventListener("click", () => {
    if (form) form.elements.service.value = link.dataset.service;
  }),
);
form?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const message = [
    "Bonjou Social Media Globe!",
    "Non: " + data.get("name").trim(),
    "Imèl: " + data.get("email").trim(),
    "Sèvis: " + data.get("service"),
    "",
    data.get("message").trim(),
  ].join("\n");
  const url = "https://wa.me/16816000916?text=" + encodeURIComponent(message);
  window.open(url, "_blank", "noopener,noreferrer");
  const status = form.querySelector(".form-status");
  status.replaceChildren(document.createTextNode("Mesaj ou pare. "));
  const fallback = document.createElement("a");
  fallback.href = url;
  fallback.target = "_blank";
  fallback.rel = "noopener noreferrer";
  fallback.textContent = "Louvri WhatsApp pou verifye epi voye li ↗";
  status.append(fallback);
});

// Progressive enhancements: filtering, scroll feedback and restrained motion.
const filters = document.querySelectorAll("[data-filter]");
filters.forEach((button) =>
  button.addEventListener("click", () => {
    const category = button.dataset.filter;
    filters.forEach((item) => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    let count = 0;
    document.querySelectorAll(".service").forEach((card) => {
      card.hidden = category !== "all" && card.dataset.category !== category;
      if (!card.hidden) count++;
    });
    document.querySelector(".filter-status").textContent =
      count + " domèn ekspètiz parèt.";
  }),
);
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
if ("IntersectionObserver" in window) {
  const reveal = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (!reduceMotion.matches) entry.target.classList.add("reveal-in");
          reveal.unobserve(entry.target);
        }
      }),
    { threshold: 0.08 },
  );
  document
    .querySelectorAll(
      ".service,.section-heading,.approach-copy,.social-card,.faq-grid",
    )
    .forEach((el) => reveal.observe(el));
  const navLinks = [...document.querySelectorAll("#navigation a")];
  const sectionsObserver = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting)
          navLinks.forEach((a) =>
            a.classList.toggle("current", a.hash === "#" + entry.target.id),
          );
      }),
    { rootMargin: "-15% 0px -50% 0px" },
  );
  document
    .querySelectorAll("#services,#approach,#social")
    .forEach((section) => sectionsObserver.observe(section));
}
const progress = document.querySelector(".scroll-progress");
function updateProgress() {
  const bar = document.querySelector(".mobile-contact");
  const hero = document.querySelector(".hero");
  const contact = document.querySelector("#contact");
  if (bar && hero && contact) {
    const rect = contact.getBoundingClientRect();
    bar.classList.toggle(
      "hide",
      hero.getBoundingClientRect().bottom > 120 ||
        (rect.top < innerHeight && rect.bottom > 90),
    );
  }
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (progress)
    progress.style.transform =
      "scaleX(" + (max > 0 ? window.scrollY / max : 0) + ")";
}
window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", updateProgress);
updateProgress();
