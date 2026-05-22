/**
 * ============================================================
 *  TERRY TENDER WEAR — DATABASE LAYER  (db.js)
 * ============================================================
 *  Smart data layer that:
 *   • Uses Supabase when supabase-config.js has real credentials
 *   • Falls back to LocalStorage automatically otherwise
 *   • All functions return Promises — same API either way
 *   • Exposes window.DB for all pages to use
 *   • Exposes window._sbClient for admin.html auth checks
 * ============================================================
 */

(function () {
  "use strict";

  // ── Seed data (used when LocalStorage is empty) ───────────
  var SEEDS = [
    { id:1, name:"Rosebud Onesie",       price:1200, category:"Onesies",   description:"Ultra-soft cotton onesie with a delicate rose print. Perfect for newborns.", image_url:"https://images.unsplash.com/photo-1522771930-78848d9293e8?w=500&h=500&auto=format&fit=crop&q=80", stock:25, is_new:true,  is_featured:true,  created_at:new Date().toISOString() },
    { id:2, name:"Sage Snuggle Set",     price:2400, category:"Sets",      description:"Two-piece matching set in calming sage green. Machine washable.",             image_url:"https://images.unsplash.com/photo-1519689680058-324335c77eba?w=500&h=500&auto=format&fit=crop&q=80", stock:15, is_new:true,  is_featured:false, created_at:new Date().toISOString() },
    { id:3, name:"Cloud Knit Romper",    price:1800, category:"Rompers",   description:"Lightweight knit romper with easy snap closure. Breathable and cosy.",        image_url:"https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=500&auto=format&fit=crop&q=80", stock:20, is_new:true,  is_featured:true,  created_at:new Date().toISOString() },
    { id:4, name:"Petal Soft Sleepsuit", price:1500, category:"Sleepwear", description:"Footed sleepsuit in brushed cotton. Keeps babies warm all night.",            image_url:"https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=500&h=500&auto=format&fit=crop&q=80", stock:30, is_new:false, is_featured:false, created_at:new Date().toISOString() },
    { id:5, name:"Linen Bloom Dress",    price:2100, category:"Dresses",   description:"Airy linen blend dress with flutter sleeves. Ideal for warm occasions.",     image_url:"https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&h=500&auto=format&fit=crop&q=80", stock:12, is_new:false, is_featured:true,  created_at:new Date().toISOString() },
    { id:6, name:"Warm Hug Cardigan",    price:1950, category:"Knitwear",  description:"Hand-knit style cardigan in warm ivory. Buttons at front for easy dressing.", image_url:"https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?w=500&h=500&auto=format&fit=crop&q=80", stock:18, is_new:true,  is_featured:false, created_at:new Date().toISOString() },
  ];

  var LS_PRODUCTS = "ttw_products_v2";
  var LS_ORDERS   = "ttw_orders_v2";
  var LS_AUTH     = "ttw_admin_auth_v2";

  // ── Supabase client (created once and reused) ─────────────
  var _client = null;

  function _getClient() {
    if (_client) return _client;

    var cfg = window.TERRY_CONFIG;
    if (!cfg || !cfg.configured) return null;

    // window.supabase is the UMD global from the CDN script
    if (!window.supabase || typeof window.supabase.createClient !== "function") {
      console.error("TTW: Supabase SDK not loaded. Make sure the CDN <script> is before db.js");
      return null;
    }

    try {
      _client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey, {
        auth: {
          persistSession:    true,
          autoRefreshToken:  true,
          detectSessionInUrl: false,
        },
      });
      // Expose for admin.html
      window._sbClient = _client;
      return _client;
    } catch (err) {
      console.error("TTW: Supabase createClient failed:", err);
      return null;
    }
  }

  // ── LocalStorage helpers ──────────────────────────────────
  function lsGet(key, fallback) {
    try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch (e) { return fallback; }
  }

  function lsSet(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }

  function lsNextId(arr) {
    if (!arr.length) return 1;
    return Math.max.apply(null, arr.map(function (x) { return x.id || 0; })) + 1;
  }

  function lsProducts() {
    var p = lsGet(LS_PRODUCTS, null);
    if (!p) { lsSet(LS_PRODUCTS, SEEDS); return SEEDS.slice(); }
    return p;
  }

  // ── Supabase error formatter ──────────────────────────────
  function sbError(err) {
    if (!err) return new Error("Unknown Supabase error");
    var msg = err.message || err.details || err.hint || JSON.stringify(err);
    console.error("TTW Supabase error:", err);
    return new Error(msg);
  }

  // ══════════════════════════════════════════════════════════
  //  PUBLIC DB API
  // ══════════════════════════════════════════════════════════
  var DB = {

    isUsingSupabase: function () { return !!_getClient(); },

    // ── Products ────────────────────────────────────────────

    getAll: async function () {
      var sb = _getClient();
      if (sb) {
        var res = await sb.from("products").select("*").order("created_at", { ascending: false });
        if (res.error) throw sbError(res.error);
        return res.data || [];
      }
      return lsProducts();
    },

    getById: async function (id) {
      var sb = _getClient();
      if (sb) {
        var res = await sb.from("products").select("*").eq("id", id).maybeSingle();
        if (res.error) throw sbError(res.error);
        return res.data;
      }
      var p = lsProducts();
      return p.find(function (x) { return String(x.id) === String(id); }) || null;
    },

    getFeatured: async function () {
      var all = await DB.getAll();
      return all.filter(function (p) { return p.is_featured; });
    },

    getNewArrivals: async function () {
      var all = await DB.getAll();
      return all.filter(function (p) { return p.is_new; });
    },

    create: async function (product) {
      // Strip client-side id before inserting — Supabase generates it
      var payload = Object.assign({}, product);
      delete payload.id;
      delete payload.created_at;

      var sb = _getClient();
      if (sb) {
        var res = await sb.from("products").insert(payload).select().single();
        if (res.error) throw sbError(res.error);
        return res.data;
      }
      var products = lsProducts();
      var newProd  = Object.assign({}, payload, {
        id:         lsNextId(products),
        created_at: new Date().toISOString(),
      });
      products.unshift(newProd);
      lsSet(LS_PRODUCTS, products);
      return newProd;
    },

    update: async function (id, changes) {
      var payload = Object.assign({}, changes);
      delete payload.id;
      delete payload.created_at;

      var sb = _getClient();
      if (sb) {
        var res = await sb.from("products").update(payload).eq("id", id).select().single();
        if (res.error) throw sbError(res.error);
        return res.data;
      }
      var products = lsProducts().map(function (p) {
        return String(p.id) === String(id) ? Object.assign({}, p, payload) : p;
      });
      lsSet(LS_PRODUCTS, products);
      return products.find(function (p) { return String(p.id) === String(id); }) || null;
    },

    delete: async function (id) {
      var sb = _getClient();
      if (sb) {
        var res = await sb.from("products").delete().eq("id", id);
        if (res.error) throw sbError(res.error);
        return true;
      }
      lsSet(LS_PRODUCTS, lsProducts().filter(function (p) { return String(p.id) !== String(id); }));
      return true;
    },

    resetToDefaults: function () {
      lsSet(LS_PRODUCTS, SEEDS);
    },

    // ── Orders ──────────────────────────────────────────────

    saveOrder: async function (order) {
      var payload = {
        customer_name:  order.customer_name  || "",
        customer_phone: order.customer_phone || "",
        items:          order.items          || [],
        total:          order.total          || 0,
        status:         order.status         || "pending",
        notes:          order.notes          || "",
      };

      var sb = _getClient();
      if (sb) {
        // Orders use the anon key + public INSERT policy — no auth needed
        var res = await sb.from("orders").insert(payload).select().single();
        if (res.error) {
          // Non-fatal — log but don't crash the WhatsApp checkout
          console.warn("TTW: Could not save order to Supabase:", res.error);
          return null;
        }
        return res.data;
      }
      // LocalStorage fallback
      var orders = lsGet(LS_ORDERS, []);
      var newOrder = Object.assign({}, payload, {
        id:         Date.now(),
        created_at: new Date().toISOString(),
      });
      orders.unshift(newOrder);
      lsSet(LS_ORDERS, orders);
      return newOrder;
    },

    getOrders: async function () {
      var sb = _getClient();
      if (sb) {
        var res = await sb.from("orders").select("*").order("created_at", { ascending: false });
        if (res.error) throw sbError(res.error);
        return res.data || [];
      }
      return lsGet(LS_ORDERS, []);
    },

    updateOrderStatus: async function (id, status) {
      var sb = _getClient();
      if (sb) {
        var res = await sb.from("orders").update({ status: status }).eq("id", id).select().single();
        if (res.error) throw sbError(res.error);
        return res.data;
      }
      var orders = lsGet(LS_ORDERS, []).map(function (o) {
        return String(o.id) === String(id) ? Object.assign({}, o, { status: status }) : o;
      });
      lsSet(LS_ORDERS, orders);
      return orders.find(function (o) { return String(o.id) === String(id); }) || null;
    },

    // ── Admin Auth ──────────────────────────────────────────

    adminLogin: async function (email, password) {
      var sb = _getClient();
      if (sb) {
        if (!email) throw new Error("Email is required when Supabase is connected.");
        var res = await sb.auth.signInWithPassword({ email: email, password: password });
        if (res.error) throw sbError(res.error);
        return res.data;
      }
      // LocalStorage fallback — simple password check
      if (password === "terry2024") {
        lsSet(LS_AUTH, "true");
        return { user: { email: "admin@local" } };
      }
      throw new Error("Wrong password. Default is: terry2024");
    },

    adminLogout: async function () {
      var sb = _getClient();
      if (sb) {
        await sb.auth.signOut();
      }
      localStorage.removeItem(LS_AUTH);
    },

    isAdminLoggedIn: async function () {
      var sb = _getClient();
      if (sb) {
        var res = await sb.auth.getSession();
        return !!(res.data && res.data.session);
      }
      return lsGet(LS_AUTH, null) === "true";
    },

    getAdminUser: async function () {
      var sb = _getClient();
      if (sb) {
        var res = await sb.auth.getUser();
        return (res.data && res.data.user) ? res.data.user : null;
      }
      return { email: "Local Admin" };
    },
  };

  // Expose globally
  window.DB = DB;

  // Initialise the client immediately so window._sbClient is set
  // before any page scripts run their DOMContentLoaded handlers
  _getClient();

})();
