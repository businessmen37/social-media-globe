# Social Media Globe

Haitian-Creole agency website. Static HTML/CSS/JavaScript, served from the repository root by GitHub Pages. Custom domain remains socialmediaglobe.net.

## Contact

- WhatsApp and phone: +1 681-600-0916
- Email: info@socialmediaglobe.net
- Contact form validates input and opens a prefilled WhatsApp message for the visitor to review/send. It does not submit email, store leads, or require a backend.

## Scope

Nine service cards; dedicated Facebook, Instagram, YouTube and TikTok section; responsive navigation; original SVG globe logo. No portfolio, fabricated results, payment scripts, cart, sign-in, or checkout in the active site. Former account/admin URLs now lead visitors to contact.

## Legacy infrastructure

The unused supabase folder and supabase-app.js remain for history only and are not loaded by the public site. No backend or payment-provider configuration was changed. Existing deployed backend functions, if any, are outside this frontend rebuild.

## Preview

Serve this folder with a local static server. Open index.html, test mobile navigation and the contact form. External links require network access. Google Fonts are optional; system sans-serif fonts provide a fallback.

## Visual redesign

White editorial layout with 18–20px reading text, large contact buttons, optimized conceptual technology images, filterable expertise cards, expandable FAQs, current-section navigation, scroll progress and restrained motion. Reduced-motion preferences are respected.

Custom images were generated with the built-in image generation tool and are conceptual illustrations, not photographs of employees or client projects. Hero: a premium laptop still life with an interconnected luminous globe and glass orbit. Strategy: a bright laptop/notebook planning workspace.

Social logo artwork: Simple Icons (brand trademarks remain the property of their respective owners). Service and checkmark icons: Lucide. Source SVGs and licenses are in assets/icons.

## Search and languages

Service guides and AI-video pages are available at /services/{ht,en,fr,es}/ and /ai-video/{ht,en,fr,es}/. The homepage remains Haitian Creole. Corresponding localized pages use reciprocal hreflang annotations and visible language links. Canonicals, Organization/WebSite/Service/Breadcrumb JSON-LD, social previews, robots.txt and sitemap.xml are included. Account/admin utility pages are noindex. Fonts are self-hosted in assets/fonts with OFL licenses.

Search Console ownership and sitemap submission must be verified separately. No ranking or indexing guarantee is implied. Content describes only the agreed service scope, including owner-confirmed AI video creation, editing and automation.

The stylesheet source files are style.css and seo.css; the served stylesheet is their minified combination at assets/site.min.css. script.js is served as assets/site.min.js. After editing those sources, regenerate the bundles with esbuild. Responsive WebP variants are referenced through srcset. Fonts are preloaded from assets/fonts.

Service-card buttons read “Pale nou de sa” and open WhatsApp directly with a unique prefilled message for the chosen service. No message is sent automatically.

## Distinct section imagery

The homepage hero, planning section and AI feature use separate images. Each AI service language page has its own conceptual visual, with responsive WebP variants and a matching social preview. These are illustrative visuals, not evidence of real offices, equipment ownership or client results.
