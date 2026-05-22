/**
 * ============================================================
 *  TERRY TENDER WEAR — SUPABASE CONFIG  (supabase-config.js)
 * ============================================================
 *  Edit ONLY the two lines marked below.
 *  Everything else is automatic.
 * ============================================================
 *
 *  HOW TO CONNECT:
 *  1. Go to https://supabase.com → your project → Settings → API
 *  2. Copy "Project URL"   → paste as SUPABASE_URL below
 *  3. Copy "anon / public" → paste as SUPABASE_ANON_KEY below
 *  4. Save the file and reload the site.
 *
 *  HOW TO CHANGE WHATSAPP NUMBER:
 *  Change WHATSAPP_NUMBER below (international format, no + sign).
 * ============================================================
 */

// ── EDIT THESE TWO LINES ─────────────────────────────────────
var SUPABASE_URL      = "https://YOUR_PROJECT_ID.supabase.co"; // ← your Project URL
var SUPABASE_ANON_KEY = "YOUR_ANON_PUBLIC_KEY_HERE";           // ← your anon/public key
// ─────────────────────────────────────────────────────────────

// ── EDIT THIS IF YOUR WHATSAPP NUMBER CHANGES ────────────────
var WHATSAPP_NUMBER = "254794036128"; // No + sign, no spaces
// ─────────────────────────────────────────────────────────────

// Auto-detect if credentials have been filled in
var SUPABASE_CONFIGURED = (
  SUPABASE_URL      !== "https://YOUR_PROJECT_ID.supabase.co" &&
  SUPABASE_ANON_KEY !== "YOUR_ANON_PUBLIC_KEY_HERE" &&
  SUPABASE_URL.indexOf("supabase.co") !== -1 &&
  SUPABASE_ANON_KEY.length > 20
);

// Expose globally so db.js and all pages can read it
window.TERRY_CONFIG = {
  supabaseUrl:  SUPABASE_URL,
  supabaseKey:  SUPABASE_ANON_KEY,
  configured:   SUPABASE_CONFIGURED,
  whatsapp:     WHATSAPP_NUMBER,
};

// Log connection status to browser console (helpful for debugging)
if (SUPABASE_CONFIGURED) {
  console.log("%c✅ Terry Tender Wear: Supabase connected", "color:green;font-weight:bold");
  console.log("URL:", SUPABASE_URL);
} else {
  console.log("%c⚠️ Terry Tender Wear: Running in Local Storage mode", "color:orange;font-weight:bold");
  console.log("Edit supabase-config.js to connect your Supabase database.");
}

/*
 * ============================================================
 *  SUPABASE SQL SETUP — run these in your Supabase SQL editor
 * ============================================================

-- 1. Products table
CREATE TABLE IF NOT EXISTS products (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT        NOT NULL,
  price       INTEGER     NOT NULL,
  category    TEXT        NOT NULL DEFAULT '',
  description TEXT        NOT NULL DEFAULT '',
  image_url   TEXT        NOT NULL DEFAULT '',
  stock       INTEGER     NOT NULL DEFAULT 0,
  is_new      BOOLEAN     NOT NULL DEFAULT false,
  is_featured BOOLEAN     NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Orders table
CREATE TABLE IF NOT EXISTS orders (
  id             BIGSERIAL PRIMARY KEY,
  customer_name  TEXT        NOT NULL DEFAULT '',
  customer_phone TEXT        NOT NULL DEFAULT '',
  items          JSONB       NOT NULL DEFAULT '[]',
  total          INTEGER     NOT NULL DEFAULT 0,
  status         TEXT        NOT NULL DEFAULT 'pending',
  notes          TEXT        NOT NULL DEFAULT '',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders   ENABLE ROW LEVEL SECURITY;

-- Drop any old conflicting policies first
DROP POLICY IF EXISTS "Public read products"  ON products;
DROP POLICY IF EXISTS "Admin all products"    ON products;
DROP POLICY IF EXISTS "Public insert orders"  ON orders;
DROP POLICY IF EXISTS "Admin all orders"      ON orders;

-- Anyone can READ products (public storefront)
CREATE POLICY "Public read products"
  ON products FOR SELECT
  USING (true);

-- Authenticated users (admin) can do anything with products
CREATE POLICY "Admin all products"
  ON products FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Anyone (including anonymous customers) can INSERT orders
CREATE POLICY "Public insert orders"
  ON orders FOR INSERT
  WITH CHECK (true);

-- Authenticated users (admin) can read and update orders
CREATE POLICY "Admin all orders"
  ON orders FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 4. Seed sample products (optional)
INSERT INTO products (name, price, category, description, image_url, stock, is_new, is_featured) VALUES
  ('Rosebud Onesie',       1200, 'Onesies',   'Ultra-soft cotton onesie with a delicate rose print.',         'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=500&q=80', 25, true,  true),
  ('Sage Snuggle Set',     2400, 'Sets',       'Two-piece matching set in calming sage green.',                 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=500&q=80', 15, true,  false),
  ('Cloud Knit Romper',    1800, 'Rompers',    'Lightweight knit romper with easy snap closure.',               'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&q=80', 20, true,  true),
  ('Petal Soft Sleepsuit', 1500, 'Sleepwear',  'Footed sleepsuit in brushed cotton. Keeps babies warm.',       'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=500&q=80', 30, false, false),
  ('Linen Bloom Dress',    2100, 'Dresses',    'Airy linen blend dress with flutter sleeves.',                 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&q=80', 12, false, true),
  ('Warm Hug Cardigan',    1950, 'Knitwear',   'Hand-knit style cardigan in ivory. Buttons at front.',         'https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?w=500&q=80', 18, true,  false);

 * ============================================================
 */
