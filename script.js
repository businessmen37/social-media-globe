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
