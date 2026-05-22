/**
 * ============================================================
 *  TERRY TENDER WEAR — SHOPPING CART  (cart.js)
 * ============================================================
 *  • Persistent via localStorage
 *  • Slide-out drawer (right on desktop, bottom sheet on mobile)
 *  • Qty controls, remove, clear cart
 *  • Free-delivery progress bar
 *  • WhatsApp checkout with optional customer name
 *  • Order logged to DB (non-blocking)
 *  • Toast notifications
 * ============================================================
 */

(function () {
  "use strict";

  var CART_KEY      = "ttw_cart_v3";
  var FREE_DELIVERY = 3000; // KES

  /* ── State ─────────────────────────────────────────────── */
  var _items       = [];
  var _subs        = [];
  var _drawerReady = false;

  function _load()    { try { _items = JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch(e){ _items=[]; } }
  function _save()    { try { localStorage.setItem(CART_KEY, JSON.stringify(_items)); } catch(e){} }
  function _fire()    { _subs.forEach(function(fn){ try{fn();}catch(e){} }); }

  _load();

  /* ── Public API ─────────────────────────────────────────── */
  var Cart = {

    subscribe: function(fn){ _subs.push(fn); },

    getItems: function(){ return _items.slice(); },

    count: function(){
      return _items.reduce(function(s,i){ return s+i.qty; }, 0);
    },

    total: function(){
      return _items.reduce(function(s,i){ return s+(i.price*i.qty); }, 0);
    },

    add: function(product){
      _load();
      var found = null;
      for(var i=0;i<_items.length;i++){
        if(String(_items[i].id)===String(product.id)){ found=_items[i]; break; }
      }
      if(found){
        var max = (product.stock!=null && product.stock>0) ? product.stock : 99;
        found.qty = Math.min(found.qty+1, max);
      } else {
        _items.push({
          id:    product.id,
          name:  product.name,
          price: Number(product.price),
          image: product.image_url || "",
          stock: product.stock!=null ? product.stock : 99,
          qty:   1,
        });
      }
      _save(); _fire();
      Cart._toast("\uD83D\uDED2 " + product.name + " added to cart!");
    },

    setQty: function(id, qty){
      _load();
      qty = parseInt(qty,10);
      _items = _items.reduce(function(acc,item){
        if(String(item.id)===String(id)){
          var max = item.stock||99;
          var q   = Math.max(0, Math.min(qty, max));
          if(q>0){ item.qty=q; acc.push(item); }
        } else { acc.push(item); }
        return acc;
      },[]);
      _save(); _fire();
    },

    remove: function(id){
      _load();
      _items = _items.filter(function(i){ return String(i.id)!==String(id); });
      _save(); _fire();
    },

    clear: function(){
      _items=[];
      _save(); _fire();
    },

    /* ── Toast ──────────────────────────────────────────── */
    _toast: function(msg){
      var t = document.getElementById("cart-toast");
      if(!t){
        t = document.createElement("div");
        t.id = "cart-toast";
        document.body.appendChild(t);
      }
      t.textContent = msg;
      t.classList.add("show");
      clearTimeout(t._tid);
      t._tid = setTimeout(function(){ t.classList.remove("show"); }, 2800);
    },

    /* ── Drawer ─────────────────────────────────────────── */
    openDrawer: function(){
      _buildDrawer();
      Cart._render();
      document.getElementById("cart-overlay").classList.add("visible");
      document.getElementById("cart-drawer").classList.add("open");
      document.body.style.overflow="hidden";
      var cb = document.getElementById("cart-close-btn");
      if(cb) setTimeout(function(){ cb.focus(); }, 350);
    },

    closeDrawer: function(){
      var ov = document.getElementById("cart-overlay");
      var dr = document.getElementById("cart-drawer");
      if(ov) ov.classList.remove("visible");
      if(dr) dr.classList.remove("open");
      document.body.style.overflow="";
    },

    /* ── WhatsApp Checkout ──────────────────────────────── */
    checkout: async function(customerName){
      var items = Cart.getItems();
      if(!items.length){ Cart._toast("Your cart is empty!"); return; }
      customerName = (customerName||"").trim();

      var lines = items.map(function(i){
        return "\u2022 "+i.name+" (x"+i.qty+") \u2014 KES "+(i.price*i.qty).toLocaleString();
      }).join("\n");

      var total    = Cart.total();
      var greeting = customerName
        ? "Hello, my name is "+customerName+".\n\n"
        : "Hello Terry Tender Wear,\n\n";
      var msg = greeting +
        "I would like to place the following order:\n\n" +
        lines + "\n\n" +
        "*Total: KES "+total.toLocaleString()+"*\n\n" +
        "Please confirm availability and delivery. Thank you! \uD83D\uDED8";

      var num = (window.TERRY_CONFIG&&window.TERRY_CONFIG.whatsapp)||"254794036128";
      window.open("https://wa.me/"+num+"?text="+encodeURIComponent(msg), "_blank");

      // Log order — non-blocking, never crashes the checkout
      if(window.DB){
        try {
          await window.DB.saveOrder({
            customer_name:  customerName||"WhatsApp Customer",
            customer_phone: "",
            items:          items,
            total:          total,
            status:         "pending",
          });
        } catch(e){ console.warn("Order log failed (non-fatal):", e); }
      }
    },

    /* ── Render drawer content ──────────────────────────── */
    _render: function(){
      var body   = document.getElementById("cart-body");
      var footer = document.getElementById("cart-footer");
      if(!body) return;

      var items  = Cart.getItems();
      var count  = Cart.count();
      var total  = Cart.total();

      var hc = document.getElementById("cart-hdr-count");
      if(hc) hc.textContent = count ? "("+count+")" : "";

      /* Empty */
      if(!items.length){
        body.innerHTML =
          '<div class="cart-empty">' +
            '<div class="cart-empty-icon">\uD83D\uDED2</div>' +
            '<p>Your cart is empty</p>' +
            '<small>Add some adorable pieces!</small>' +
          '</div>';
        var shopBtn = document.createElement("button");
        shopBtn.className = "btn btn-dark";
        shopBtn.style.marginTop = "1.5rem";
        shopBtn.textContent = "Shop Now \u2192";
        shopBtn.addEventListener("click", function(){
          Cart.closeDrawer();
          window.location.href = "products.html";
        });
        body.querySelector(".cart-empty").appendChild(shopBtn);
        footer.innerHTML="";
        return;
      }

      /* Items */
      var list = document.createElement("div");
      list.className = "cart-items-list";

      items.forEach(function(item){
        var row = document.createElement("div");
        row.className = "cart-item";

        var img = item.image || "https://via.placeholder.com/72x72/FF6B6B/fff?text=TTW";

        row.innerHTML =
          '<img class="cart-item-img" src="'+img+'" alt="'+_esc(item.name)+'"' +
               ' onerror="this.src=\'https://via.placeholder.com/72x72/FF6B6B/fff?text=TTW\'">' +
          '<div class="cart-item-info">' +
            '<div class="cart-item-name">'+_esc(item.name)+'</div>' +
            '<div class="cart-item-price">KES '+Number(item.price).toLocaleString()+' each</div>' +
            '<div class="qty-controls">' +
              '<button class="qty-btn j-dec" aria-label="Decrease">\u2212</button>' +
              '<span class="qty-value">'+item.qty+'</span>' +
              '<button class="qty-btn j-inc" aria-label="Increase">+</button>' +
            '</div>' +
          '</div>' +
          '<div class="cart-item-right">' +
            '<div class="cart-item-subtotal">KES '+(item.price*item.qty).toLocaleString()+'</div>' +
            '<button class="cart-remove-btn j-rem" aria-label="Remove">\uD83D\uDDD1</button>' +
          '</div>';

        /* Bind controls with closure */
        (function(id, qty){
          row.querySelector(".j-dec").addEventListener("click", function(){ Cart.setQty(id, qty-1); Cart._render(); });
          row.querySelector(".j-inc").addEventListener("click", function(){ Cart.setQty(id, qty+1); Cart._render(); });
          row.querySelector(".j-rem").addEventListener("click", function(){ Cart.remove(id); Cart._render(); });
        })(item.id, item.qty);

        list.appendChild(row);
      });

      body.innerHTML="";
      body.appendChild(list);

      /* Footer */
      var remaining = Math.max(0, FREE_DELIVERY - total);
      var pct       = Math.min(100, Math.round((total/FREE_DELIVERY)*100));
      var freeMsg   = remaining>0
        ? "\uD83D\uDE9A Add KES "+remaining.toLocaleString()+" more for free delivery"
        : "\uD83C\uDF89 You've unlocked free delivery!";
      var freeCls   = remaining===0 ? "cart-delivery-note cart-free-banner" : "cart-delivery-note";
      var barColor  = remaining===0 ? "#25D366" : "var(--rose-d)";

      footer.innerHTML =
        '<div class="cart-total-row">' +
          '<span>Subtotal ('+count+' item'+(count!==1?"s":"")+')</span>' +
          '<strong>KES '+total.toLocaleString()+'</strong>' +
        '</div>' +
        '<div class="'+freeCls+'">'+freeMsg+'</div>' +
        '<div style="height:5px;background:var(--line);border-radius:50px;overflow:hidden;margin-bottom:.9rem">' +
          '<div style="height:100%;width:'+pct+'%;background:'+barColor+';border-radius:50px;transition:width .4s ease"></div>' +
        '</div>' +
        '<input type="text" id="cart-name" class="cart-name-input" placeholder="Your name (optional)" autocomplete="name"/>' +
        '<button id="cart-checkout-btn" class="btn-checkout-wa">' +
          '<svg viewBox="0 0 24 24" fill="currentColor" width="19" height="19">' +
            '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966' +
            '-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059' +
            '-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371' +
            '-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0' +
            '-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2' +
            ' 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413' +
            '.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031' +
            '-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884' +
            ' 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884' +
            '-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547' +
            ' 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335' +
            ' 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>' +
          '</svg>' +
          'Order via WhatsApp \u2014 KES '+total.toLocaleString() +
        '</button>' +
        '<button id="cart-clear-btn" class="btn-cart-clear">Clear cart</button>';

      document.getElementById("cart-checkout-btn").addEventListener("click", function(){
        var name = (document.getElementById("cart-name")||{}).value||"";
        Cart.checkout(name);
      });
      document.getElementById("cart-clear-btn").addEventListener("click", function(){
        if(confirm("Clear your entire cart?")){ Cart.clear(); Cart._render(); }
      });
    },
  };

  /* ── Build drawer DOM once ───────────────────────────────── */
  function _buildDrawer(){
    if(_drawerReady) return;
    _drawerReady = true;

    var ov = document.createElement("div");
    ov.id = "cart-overlay";
    ov.addEventListener("click", Cart.closeDrawer);

    var dr = document.createElement("div");
    dr.id = "cart-drawer";
    dr.setAttribute("role","dialog");
    dr.setAttribute("aria-modal","true");
    dr.setAttribute("aria-label","Shopping cart");
    dr.innerHTML =
      '<div class="cart-header">' +
        '<h2>Your Cart <span id="cart-hdr-count" class="cart-header-count"></span></h2>' +
        '<button class="cart-close-btn" id="cart-close-btn" aria-label="Close cart">\u00D7</button>' +
      '</div>' +
      '<div class="cart-body" id="cart-body"></div>' +
      '<div class="cart-footer" id="cart-footer"></div>';

    document.body.appendChild(ov);
    document.body.appendChild(dr);

    document.getElementById("cart-close-btn").addEventListener("click", Cart.closeDrawer);

    document.addEventListener("keydown", function(e){
      if(e.key==="Escape") Cart.closeDrawer();
    });
  }

  /* ── Badge updater ───────────────────────────────────────── */
  function updateCartBadge(){
    var c = Cart.count();
    document.querySelectorAll(".cart-count").forEach(function(b){
      b.textContent   = c;
      b.style.display = c>0 ? "flex" : "none";
    });
  }

  function _esc(s){ return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

  Cart.subscribe(updateCartBadge);
  Cart.subscribe(function(){ if(document.getElementById("cart-body")) Cart._render(); });

  window.Cart            = Cart;
  window.updateCartBadge = updateCartBadge;

})();
