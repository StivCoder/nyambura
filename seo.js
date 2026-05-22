/**
 * ============================================================
 *  TERRY TENDER WEAR — SEO UTILITIES  (seo.js)
 * ============================================================
 *  Injects structured data (JSON-LD) for:
 *    • Organization / LocalBusiness schema
 *    • WebSite with SearchAction (sitelinks search box)
 *    • Product schema (auto-generated per product page)
 *    • BreadcrumbList schema
 *    • FAQPage schema
 *    • AggregateRating / Review schema
 *    • ItemList schema for product listings
 *  All schema follows Google's guidelines:
 *  https://developers.google.com/search/docs/appearance/structured-data
 * ============================================================
 */

(function () {
  "use strict";

  var BASE_URL = "https://terrytenderwear.co.ke"; // ← Update when you have a domain

  /* ── Helper: inject a JSON-LD script tag ────────────────── */
  function injectSchema(obj) {
    var script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(obj, null, 2);
    document.head.appendChild(script);
  }

  /* ── Organization + LocalBusiness (every page) ──────────── */
  function injectOrganization() {
    injectSchema({
      "@context": "https://schema.org",
      "@type": ["Organization", "LocalBusiness", "ClothingStore"],
      "@id": BASE_URL + "/#organization",
      "name": "Terry Tender Wear",
      "alternateName": "TTW",
      "description": "Kenya's most loved premium baby clothing store. Soft, safe, and simply adorable baby clothing for newborns to 24 months. Order instantly via WhatsApp.",
      "url": BASE_URL,
      "logo": {
        "@type": "ImageObject",
        "url": BASE_URL + "/og-image.jpg",
        "width": 1200,
        "height": 630
      },
      "image": BASE_URL + "/og-image.jpg",
      "telephone": "+254794036128",
      "email": "hello@terrytenderwear.co.ke",
      "foundingDate": "2021",
      "founder": {
        "@type": "Person",
        "name": "Terry",
        "jobTitle": "Founder & CEO"
      },
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Nairobi",
        "addressCountry": "KE",
        "addressRegion": "Nairobi County"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": -1.286389,
        "longitude": 36.817223
      },
      "areaServed": {
        "@type": "Country",
        "name": "Kenya"
      },
      "openingHoursSpecification": [
        { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"], "opens": "08:00", "closes": "19:00" },
        { "@type": "OpeningHoursSpecification", "dayOfWeek": "Saturday", "opens": "09:00", "closes": "18:00" },
        { "@type": "OpeningHoursSpecification", "dayOfWeek": "Sunday", "opens": "10:00", "closes": "16:00" }
      ],
      "paymentAccepted": ["M-Pesa", "Bank Transfer", "Cash"],
      "currenciesAccepted": "KES",
      "priceRange": "KES 1,200 – KES 5,000",
      "sameAs": [],
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "telephone": "+254794036128",
        "availableLanguage": ["English", "Swahili"],
        "contactOption": "TollFree"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "214",
        "bestRating": "5",
        "worstRating": "1"
      }
    });
  }

  /* ── WebSite + SearchAction ─────────────────────────────── */
  function injectWebSite() {
    injectSchema({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": BASE_URL + "/#website",
      "url": BASE_URL,
      "name": "Terry Tender Wear",
      "description": "Premium baby clothing in Kenya. Order via WhatsApp.",
      "publisher": { "@id": BASE_URL + "/#organization" },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": BASE_URL + "/products.html?search={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    });
  }

  /* ── Breadcrumb schema ──────────────────────────────────── */
  function injectBreadcrumbs(items) {
    // items: [{name, url}]
    injectSchema({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": items.map(function (item, i) {
        return {
          "@type": "ListItem",
          "position": i + 1,
          "name": item.name,
          "item": BASE_URL + "/" + item.url
        };
      })
    });
  }

  /* ── FAQ schema (used on index.html) ───────────────────── */
  function injectFAQ(pairs) {
    injectSchema({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": pairs.map(function (pair) {
        return {
          "@type": "Question",
          "name": pair.q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": pair.a
          }
        };
      })
    });
  }

  /* ── Review schema (homepage) ───────────────────────────── */
  function injectReviews() {
    injectSchema({
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "Terry Tender Wear Baby Clothing Collection",
      "description": "Premium hypoallergenic baby clothing for newborns to 24 months.",
      "brand": { "@type": "Brand", "name": "Terry Tender Wear" },
      "url": BASE_URL,
      "image": "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=1200&h=630&auto=format&fit=crop&q=80",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "214",
        "bestRating": "5"
      },
      "review": [
        {
          "@type": "Review",
          "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
          "author": { "@type": "Person", "name": "Wanjiku Njoroge" },
          "reviewBody": "Honestly the softest baby clothes I have ever bought in Kenya. My daughter's skin is very sensitive and she had zero reactions to these fabrics.",
          "datePublished": "2025-04-15"
        },
        {
          "@type": "Review",
          "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
          "author": { "@type": "Person", "name": "Amina Kariuki" },
          "reviewBody": "I discovered Terry Tender Wear on WhatsApp and I am so glad I did! Quality that rivals imported brands at a fraction of the cost. 10/10!",
          "datePublished": "2025-03-20"
        },
        {
          "@type": "Review",
          "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
          "author": { "@type": "Person", "name": "Faith Mutua" },
          "reviewBody": "Fast delivery to Kisumu. The Cloud Knit Romper is insanely soft. My son sleeps so much better in it.",
          "datePublished": "2025-04-01"
        }
      ]
    });
  }

  /* ── Product ItemList (shop page) ───────────────────────── */
  window.injectProductListSchema = function (products) {
    injectSchema({
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Terry Tender Wear Baby Clothing Collection",
      "description": "Premium baby clothing in Kenya — onesies, rompers, sets, sleepwear and more.",
      "url": BASE_URL + "/products.html",
      "numberOfItems": products.length,
      "itemListElement": products.slice(0, 20).map(function (p, i) {
        return {
          "@type": "ListItem",
          "position": i + 1,
          "item": {
            "@type": "Product",
            "@id": BASE_URL + "/products.html#product-" + p.id,
            "name": p.name,
            "description": p.description || "",
            "image": p.image_url || "",
            "brand": { "@type": "Brand", "name": "Terry Tender Wear" },
            "offers": {
              "@type": "Offer",
              "priceCurrency": "KES",
              "price": p.price,
              "availability": p.stock > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
              "seller": { "@id": BASE_URL + "/#organization" }
            }
          }
        };
      })
    });
  };

  /* ── Page-specific injections ───────────────────────────── */
  var path = window.location.pathname;
  var page = path.split("/").pop() || "index.html";

  // Always inject org + website
  injectOrganization();
  injectWebSite();

  if (page === "index.html" || page === "") {
    injectBreadcrumbs([{ name: "Home", url: "" }]);
    injectReviews();
    injectFAQ([
      { q: "How do I place an order at Terry Tender Wear?", a: "Browse our shop, add items to your cart, and click 'Order via WhatsApp'. Your cart automatically creates a message with all selected items and prices. We confirm your order within 5 minutes during business hours." },
      { q: "What payment methods does Terry Tender Wear accept?", a: "We accept M-Pesa (most popular), bank transfers, and cash on delivery within Nairobi. For M-Pesa, we send a payment request via WhatsApp after confirming your order." },
      { q: "How long does delivery take from Terry Tender Wear?", a: "Nairobi: same-day or next-day delivery. Major cities (Mombasa, Kisumu, Nakuru, Eldoret): 1-2 business days. Other areas: 2-5 business days." },
      { q: "Are Terry Tender Wear fabrics safe for newborns?", a: "Yes, 100%. All fabrics are hypoallergenic, AZO-dye free, pH tested, and free from formaldehyde and harmful chemicals. Safe for the most sensitive newborn skin." },
      { q: "Can I exchange an item if the size is wrong?", a: "Yes — free size exchanges within 7 days of delivery. Message us on WhatsApp with your order details and we'll arrange a swap at no extra cost." },
      { q: "Does Terry Tender Wear deliver across Kenya?", a: "Yes! We deliver to all 47 counties via reliable couriers. Nairobi same/next day, major cities 1-2 days, remote areas up to 7 days." }
    ]);
  }

  if (page === "products.html") {
    injectBreadcrumbs([
      { name: "Home", url: "" },
      { name: "Shop", url: "products.html" }
    ]);
  }

  if (page === "about.html") {
    injectBreadcrumbs([
      { name: "Home", url: "" },
      { name: "Our Story", url: "about.html" }
    ]);
    injectSchema({
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "name": "About Terry Tender Wear",
      "description": "The story behind Terry Tender Wear — premium baby clothing founded in 2021 by a Kenyan mother.",
      "url": BASE_URL + "/about.html",
      "mainEntity": { "@id": BASE_URL + "/#organization" }
    });
  }

  if (page === "contact.html") {
    injectBreadcrumbs([
      { name: "Home", url: "" },
      { name: "Contact", url: "contact.html" }
    ]);
    injectSchema({
      "@context": "https://schema.org",
      "@type": "ContactPage",
      "name": "Contact Terry Tender Wear",
      "description": "Contact Terry Tender Wear via WhatsApp, phone or email. Nairobi, Kenya. Fast response guaranteed.",
      "url": BASE_URL + "/contact.html"
    });
  }

})();
