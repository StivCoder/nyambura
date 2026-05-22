/**
 * ============================================================
 *  TERRY TENDER WEAR — STOREFRONT APP  (app.js)
 * ============================================================
 *  Handles:
 *   • Mobile nav toggle
 *   • Product card builder (zero inline onclick)
 *   • Home page: new arrivals + featured grids
 *   • Products page: category filters, sort, search + live
 *     autocomplete dropdown with keyboard navigation
 * ============================================================
 *  SCRIPT LOAD ORDER (all pages):
 *    1. supabase CDN
 *    2. supabase-config.js
 *    3. db.js
 *    4. cart.js
 *    5. app.js   ← this file
 * ============================================================
 */

(function () {
  "use strict";

  /* ── Utilities ──────────────────────────────────────────── */
  function qs(sel, ctx)  { return (ctx||document).querySelector(sel); }
  function qsa(sel, ctx) { return Array.prototype.slice.call((ctx||document).querySelectorAll(sel)); }

  function esc(s) {
    return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;")
                         .replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }

  function highlight(text, query) {
    if (!query) return esc(text);
    var re = new RegExp("(" + query.replace(/[.*+?^${}()|[\]\\]/g,"\\$&") + ")", "gi");
    return esc(text).replace(re, "<mark>$1</mark>");
  }

  function skeletons(gridId, n) {
    var g = qs("#"+gridId);
    if (!g) return;
    var h = "";
    for (var i=0;i<n;i++) h += '<div class="skeleton skeleton-card"></div>';
    g.innerHTML = h;
  }

  /* ── Mobile nav ─────────────────────────────────────────── */
  function setupNav() {
    var toggle = qs("#nav-toggle");
    var links  = qs("#nav-links");
    if (!toggle || !links) return;

    toggle.addEventListener("click", function(){
      var open = links.classList.toggle("is-open");
      toggle.classList.toggle("active", open);
      toggle.setAttribute("aria-expanded", String(open));
    });

    qsa("a", links).forEach(function(a){
      a.addEventListener("click", function(){
        links.classList.remove("is-open");
        toggle.classList.remove("is-active");
        toggle.setAttribute("aria-expanded","false");
      });
    });

    document.addEventListener("click", function(e){
      if (!toggle.contains(e.target) && !links.contains(e.target)){
        links.classList.remove("is-open");
        toggle.classList.remove("is-active");
      }
    });
  }

  /* ── Single-product WhatsApp order ─────────────────────── */
  function orderWhatsApp(name, price) {
    var num = (window.TERRY_CONFIG&&window.TERRY_CONFIG.whatsapp)||"254794036128";
    var msg = "Hello Terry Tender Wear, I would like to order the *"+name+
              "* priced at KES "+Number(price).toLocaleString()+
              ". Please confirm availability and delivery. Thank you! \uD83D\uDED8";
    window.open("https://wa.me/"+num+"?text="+encodeURIComponent(msg), "_blank");
  }

  /* ── Product card builder ───────────────────────────────── */
  function buildCard(product, delay) {
    var card = document.createElement("div");
    card.className = "product-card";
    card.style.animationDelay = (delay||0)+"s";

    var stockNum = (product.stock!=null) ? product.stock : 99;
    var stockOut = stockNum === 0;
    var stockLow = !stockOut && stockNum<=5;
    var stockTxt = stockOut ? "Out of stock" : stockLow ? "Only "+stockNum+" left!" : stockNum+" in stock";
    var stockCls = stockOut ? "stock-out" : stockLow ? "stock-low" : "stock-ok";

    var img = product.image_url ||
      "https://via.placeholder.com/400x320/FF6B6B/fff?text="+encodeURIComponent(product.name||"TTW");

    card.setAttribute("itemscope", "");
    card.setAttribute("itemtype", "https://schema.org/Product");
    card.innerHTML =
      '<div class="card-badges">' +
        (product.is_new      ? '<span class="tag tag-new">New</span>'       : "") +
        (product.is_featured ? '<span class="tag tag-feat">Featured</span>' : "") +
      '</div>' +

      '<div class="card-img">' +
        '<img src="'+img+'" alt="'+esc(product.name)+'" loading="lazy"' +
             ' onerror="this.src=\'https://via.placeholder.com/400x320/FF6B6B/fff?text=TTW\'">' +
        '<div class="card-overlay">' +
          '<button class="card-overlay-btn j-quick"'+(stockOut?' disabled':'')+'>Quick Add</button>' +
        '</div>' +
      '</div>' +

      '<div class="card-body">' +
        '<div class="card-cat">'+esc(product.category||"")+'</div>' +
        '<div class="card-name">'+esc(product.name||"")+'</div>' +
        '<div class="card-desc">'+esc(product.description||"")+'</div>' +
        '<div class="card-price-row">' +
          '<div class="card-price">KES '+Number(product.price).toLocaleString()+'</div>' +
          '<div class="card-stock '+stockCls+'">'+stockTxt+'</div>' +
        '</div>' +
        '<div class="card-actions">' +
          '<button class="btn-add-cart j-cart"'+(stockOut?' disabled':'')+'>'+
            '\uD83D\uDED2 Add to Cart' +
          '</button>' +
          '<button class="btn-wa-card j-wa" title="Order via WhatsApp">' +
            '<svg viewBox="0 0 24 24" fill="currentColor" width="17" height="17">' +
              '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297' +
              '-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788' +
              '-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174' +
              '.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579' +
              '-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016' +
              '-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262' +
              '.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248' +
              '-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031' +
              '-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45' +
              ' 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994' +
              'c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0' +
              ' .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882' +
              ' 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0' +
              ' 00-3.48-8.413z"/>' +
            '</svg>' +
          '</button>' +
        '</div>' +
      '</div>';

    /* Clean event binding */
    (function(p){
      qs(".j-quick", card).addEventListener("click", function(){ if(!stockOut) window.Cart.add(p); });
      qs(".j-cart",  card).addEventListener("click", function(){ if(!stockOut) window.Cart.add(p); });
      qs(".j-wa",    card).addEventListener("click", function(){ orderWhatsApp(p.name, p.price); });
    })(product);

    return card;
  }

  /* ══════════════════════════════════════════════════════════
     HOME PAGE
     ══════════════════════════════════════════════════════════ */

  async function renderNewArrivals() {
    if (!qs("#new-arrivals-grid")) return;
    skeletons("new-arrivals-grid", 3);
    try {
      var products = await window.DB.getNewArrivals();
      var grid = qs("#new-arrivals-grid");
      grid.innerHTML = "";
      if (!products.length) {
        grid.innerHTML = '<p class="subtitle" style="grid-column:1/-1;padding:2rem 0">No new arrivals yet — check back soon!</p>';
        return;
      }
      products.slice(0,3).forEach(function(p,i){ grid.appendChild(buildCard(p, i*0.1)); });
    } catch(e) {
      var g = qs("#new-arrivals-grid");
      if(g) g.innerHTML='<p style="color:#c0392b;grid-column:1/-1;padding:2rem 0">Could not load products: '+esc(e.message)+'</p>';
    }
  }

  async function renderFeatured() {
    if (!qs("#featured-grid")) return;
    skeletons("featured-grid", 3);
    try {
      var products = await window.DB.getFeatured();
      var grid = qs("#featured-grid");
      grid.innerHTML = "";
      if (!products.length) {
        grid.innerHTML = '<p class="subtitle" style="grid-column:1/-1;padding:2rem 0">No featured products yet.</p>';
        return;
      }
      products.slice(0,3).forEach(function(p,i){ grid.appendChild(buildCard(p, i*0.1)); });
    } catch(e) {
      var g = qs("#featured-grid");
      if(g) g.innerHTML='<p style="color:#c0392b;grid-column:1/-1;padding:2rem 0">Could not load: '+esc(e.message)+'</p>';
    }
  }

  /* ══════════════════════════════════════════════════════════
     PRODUCTS PAGE
     ══════════════════════════════════════════════════════════ */

  var _all      = [];
  var _cat      = "all";
  var _sort     = "default";
  var _q        = "";
  var _hlIdx    = -1;

  async function initProductsPage() {
    if (!qs("#products-grid")) return;
    skeletons("products-grid", 6);
    try {
      _all = await window.DB.getAll();
      buildCatFilters();
      buildSortBtns();
      buildSearch();
      applyAndRender();

      /* URL pre-filter: products.html?cat=Onesies */
      var urlCat = new URLSearchParams(window.location.search).get("cat");
      if (urlCat) {
        _cat = urlCat;
        qsa(".filter-btn[data-cat]").forEach(function(b){
          b.classList.toggle("active", b.dataset.cat===urlCat);
        });
        applyAndRender();
      }
    } catch(e) {
      var g = qs("#products-grid");
      if(g) g.innerHTML='<p style="color:#c0392b;grid-column:1/-1;padding:2rem">Could not load products: '+esc(e.message)+'</p>';
    }
  }

  function buildCatFilters() {
    var bar = qs("#category-filters");
    if (!bar) return;
    var seen={}, cats=["all"];
    _all.forEach(function(p){ if(p.category&&!seen[p.category]){ seen[p.category]=1; cats.push(p.category); } });
    bar.innerHTML="";
    cats.forEach(function(cat){
      var btn=document.createElement("button");
      btn.className="filter-btn"+(cat==="all"?" active":"");
      btn.setAttribute("data-cat",cat);
      btn.textContent=cat==="all"?"All Items":cat;
      btn.addEventListener("click",function(){
        _cat=cat;
        qsa(".filter-btn[data-cat]").forEach(function(b){b.classList.remove("active");});
        btn.classList.add("active");
        applyAndRender();
      });
      bar.appendChild(btn);
    });
  }

  function buildSortBtns() {
    var bar = qs("#sort-filters");
    if (!bar) return;
    qsa(".filter-btn", bar).forEach(function(btn){
      btn.addEventListener("click", function(){
        _sort=btn.dataset.sort||"default";
        qsa(".filter-btn", bar).forEach(function(b){b.classList.remove("active");});
        btn.classList.add("active");
        applyAndRender();
      });
    });
  }

  /* ── Live search with autocomplete ─────────────────────── */
  function buildSearch() {
    var wrap = qs("#search-wrap");
    if (!wrap) return;

    wrap.innerHTML =
      '<div class="search-input-row">' +
        '<span class="search-icon" aria-hidden="true">\uD83D\uDD0D</span>' +
        '<input type="search" id="search-input" class="search-input"' +
               ' placeholder="Search products\u2026" autocomplete="off"' +
               ' aria-label="Search products" aria-autocomplete="list"' +
               ' aria-controls="search-dropdown">' +
        '<button class="search-clear" id="search-clear" aria-label="Clear search" tabindex="-1">\u00D7</button>' +
      '</div>' +
      '<div class="search-dropdown" id="search-dropdown" role="listbox"></div>';

    var input    = qs("#search-input");
    var clearBtn = qs("#search-clear");
    var dropdown = qs("#search-dropdown");

    var _tid;
    function debounce(fn, ms){ clearTimeout(_tid); _tid=setTimeout(fn,ms); }

    function openDropdown(query) {
      _hlIdx = -1;
      var q = query.trim().toLowerCase();
      if (!q) { closeDropdown(); return; }

      var results = _all.filter(function(p){
        return (p.name||"").toLowerCase().indexOf(q)!==-1 ||
               (p.category||"").toLowerCase().indexOf(q)!==-1 ||
               (p.description||"").toLowerCase().indexOf(q)!==-1;
      }).slice(0,8);

      if (!results.length) {
        dropdown.innerHTML =
          '<div class="sd-no-results"><strong>No results for \u201c'+esc(query)+'\u201d</strong>Try different keywords</div>';
        dropdown.classList.add("open");
        return;
      }

      var html = '<div class="sd-section-label">Suggestions</div>';
      results.forEach(function(p, idx){
        var img = p.image_url||"https://via.placeholder.com/44x44/FF6B6B/fff?text=TTW";
        html +=
          '<div class="sd-item" role="option" data-idx="'+idx+'" tabindex="-1">' +
            '<img class="sd-item-img" src="'+esc(img)+'" alt="" loading="lazy"' +
                 ' onerror="this.src=\'https://via.placeholder.com/44x44/FF6B6B/fff?text=TTW\'">' +
            '<div class="sd-item-info">' +
              '<div class="sd-item-name">'+highlight(p.name||"", query)+'</div>' +
              '<div class="sd-item-meta">'+esc(p.category||"")+'</div>' +
            '</div>' +
            '<div class="sd-item-price">KES '+Number(p.price).toLocaleString()+'</div>' +
          '</div>';
      });

      if (results.length>1) {
        html += '<div class="sd-footer" id="sd-see-all">See all '+results.length+' results for \u201c'+esc(query)+'\u201d</div>';
      }

      dropdown.innerHTML = html;
      dropdown.classList.add("open");

      /* Click a suggestion — add to cart */
      qsa(".sd-item", dropdown).forEach(function(el, idx){
        el.addEventListener("mousedown", function(e){
          e.preventDefault();
          var p = results[idx];
          if (p) {
            window.Cart.add(p);
            input.value="";
            clearBtn.classList.remove("visible");
            closeDropdown();
            _q=""; applyAndRender();
          }
        });
      });

      /* "See all" */
      var seeAll = qs("#sd-see-all", dropdown);
      if (seeAll) {
        seeAll.addEventListener("mousedown", function(e){
          e.preventDefault();
          _q=q; closeDropdown(); applyAndRender();
          var g=qs("#products-grid");
          if(g) g.scrollIntoView({behavior:"smooth",block:"start"});
        });
      }
    }

    function closeDropdown(){ dropdown.classList.remove("open"); _hlIdx=-1; }

    function moveHighlight(dir){
      var els = qsa(".sd-item", dropdown);
      if (!els.length) return;
      if(_hlIdx>=0&&els[_hlIdx]) els[_hlIdx].classList.remove("highlighted");
      _hlIdx+=dir;
      if(_hlIdx<0)          _hlIdx=els.length-1;
      if(_hlIdx>=els.length) _hlIdx=0;
      els[_hlIdx].classList.add("highlighted");
      els[_hlIdx].scrollIntoView({block:"nearest"});
    }

    input.addEventListener("input", function(){
      var v=input.value;
      clearBtn.classList.toggle("visible", v.length>0);
      debounce(function(){
        _q=v.trim().toLowerCase();
        applyAndRender();
        openDropdown(v);
      }, 160);
    });

    input.addEventListener("keydown", function(e){
      if (!dropdown.classList.contains("open")) return;
      if (e.key==="ArrowDown")  { e.preventDefault(); moveHighlight(1); }
      else if (e.key==="ArrowUp")   { e.preventDefault(); moveHighlight(-1); }
      else if (e.key==="Enter") {
        e.preventDefault();
        var els=qsa(".sd-item", dropdown);
        var t=_hlIdx>=0?els[_hlIdx]:null;
        if(t) t.dispatchEvent(new MouseEvent("mousedown",{bubbles:true}));
        else  closeDropdown();
      }
      else if (e.key==="Escape") { closeDropdown(); input.blur(); }
    });

    input.addEventListener("focus", function(){
      if(input.value.length>0) openDropdown(input.value);
    });
    input.addEventListener("blur",  function(){ setTimeout(closeDropdown, 200); });

    clearBtn.addEventListener("click", function(){
      input.value=""; _q="";
      clearBtn.classList.remove("visible");
      closeDropdown(); applyAndRender(); input.focus();
    });

    document.addEventListener("click", function(e){
      if(!wrap.contains(e.target)) closeDropdown();
    });
  }

  function applyAndRender() {
    var products = _all.slice();

    if (_cat!=="all") products=products.filter(function(p){ return p.category===_cat; });

    if (_q) products=products.filter(function(p){
      return (p.name||"").toLowerCase().indexOf(_q)!==-1 ||
             (p.description||"").toLowerCase().indexOf(_q)!==-1 ||
             (p.category||"").toLowerCase().indexOf(_q)!==-1;
    });

    if (_sort==="price-asc")  products.sort(function(a,b){ return a.price-b.price; });
    if (_sort==="price-desc") products.sort(function(a,b){ return b.price-a.price; });
    if (_sort==="name")       products.sort(function(a,b){ return (a.name||"").localeCompare(b.name||""); });
    if (_sort==="new")        products.sort(function(a,b){ return (b.is_new?1:0)-(a.is_new?1:0); });

    renderGrid(products);
  }

  function renderGrid(products) {
    var grid=qs("#products-grid");
    if(!grid) return;
    var ct=qs("#product-count");
    if(ct) ct.textContent=products.length+" item"+(products.length!==1?"s":"");
    grid.innerHTML="";
    if(!products.length){
      grid.innerHTML=
        '<div class="empty-state">'+
          '<div class="icon">\uD83D\uDD0D</div>'+
          '<p>No products found</p>'+
          '<small>Try a different search or category</small>'+
        '</div>';
      return;
    }
    products.forEach(function(p,i){ grid.appendChild(buildCard(p, i*0.055)); });

    // Inject Product ItemList schema for SEO (shop page only)
    if (typeof window.injectProductListSchema === "function") {
      window.injectProductListSchema(products);
    }
  }

  /* ══════════════════════════════════════════════════════════
     BOOT
     ══════════════════════════════════════════════════════════ */
  document.addEventListener("DOMContentLoaded", function(){
    setupNav();
    if(window.updateCartBadge) window.updateCartBadge();

    if(qs("#new-arrivals-grid")) renderNewArrivals();
    if(qs("#featured-grid"))     renderFeatured();
    if(qs("#products-grid"))     initProductsPage();
  });

})();
