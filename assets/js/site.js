/* =========================================================================
   CARTON PLEIN ! — comportements du site (aucune dépendance externe)
   ========================================================================= */
(function(){
  'use strict';
  var C = window.CARTON_PLEIN || {};

  // ---------- 1. HTTPS obligatoire (filet de sécurité si l'hébergeur ne redirige pas) ----------
  var h = location.hostname;
  if (location.protocol === 'http:' && h !== 'localhost' && h !== '127.0.0.1' && !/^192\.168\./.test(h)) {
    location.replace('https://' + location.host + location.pathname + location.search + location.hash);
    return;
  }

  // ---------- petits outils ----------
  function $(s, r){ return (r || document).querySelector(s); }
  function $$(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function euros(n){ return n.toFixed(2).replace('.', ',') + ' €'; }
  function store(k, v){ try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch(e){ return null; } }

  // ---------- 2. Valeurs du fichier de réglages injectées dans la page ----------
  $$('[data-cfg]').forEach(function(el){
    var k = el.getAttribute('data-cfg'), v = C[k];
    if (v == null) return;
    if (k === 'prix' || k === 'fraisLivraison') v = euros(v);
    el.textContent = v;
  });
  $$('[data-cfg-mail]').forEach(function(el){
    if (!C.emailContact) return;
    el.textContent = C.emailContact;
    if (el.tagName === 'A') el.href = 'mailto:' + C.emailContact;
  });
  if (C.enPrecommande === false) {
    $$('[data-precommande]').forEach(function(el){ el.hidden = true; });
    $$('[data-stock]').forEach(function(el){ el.hidden = false; });
  }

  // ---------- 3. Menu mobile ----------
  var tog = $('.menu-toggle'), nav = $('#site-nav');
  if (tog && nav) {
    tog.addEventListener('click', function(){
      var open = nav.classList.toggle('open');
      tog.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    $$('a', nav).forEach(function(a){ a.addEventListener('click', function(){ nav.classList.remove('open'); tog.setAttribute('aria-expanded','false'); }); });
  }

  // ---------- 4. Cookies & mesure d'audience (consentement, recommandations CNIL) ----------
  // Le choix est conservé 6 mois, puis redemandé. Refuser est aussi simple qu'accepter.
  var KEY = 'cp-consent', SIX_MOIS = 1000*60*60*24*182;
  function readConsent(){
    var raw = store(KEY); if (!raw) return null;
    try { var o = JSON.parse(raw); if (Date.now() - o.t > SIX_MOIS) return null; return o.v; } catch(e){ return null; }
  }
  function loadAnalytics(){
    if (!C.goatcounter || document.getElementById('gc-script')) return;
    var s = document.createElement('script');
    s.id = 'gc-script'; s.async = true; s.src = 'https://gc.zgo.at/count.js';
    s.setAttribute('data-goatcounter', 'https://' + C.goatcounter + '.goatcounter.com/count');
    document.head.appendChild(s);
  }
  var banner = $('#cookie');
  function showBanner(){ if (banner){ banner.hidden = false; var b = $('.no', banner); if (b) b.focus({preventScroll:true}); } }
  function decide(v){
    store(KEY, JSON.stringify({v: v, t: Date.now()}));
    if (banner) banner.hidden = true;
    if (v === 'oui') loadAnalytics();
  }
  if (banner) {
    $('.yes', banner).addEventListener('click', function(){ decide('oui'); });
    $('.no', banner).addEventListener('click', function(){ decide('non'); });
  }
  $$('[data-cookies]').forEach(function(b){ b.addEventListener('click', showBanner); });
  var choice = readConsent();
  if (choice === 'oui') loadAnalytics();
  else if (choice === null && banner) banner.hidden = false;

  // ---------- 5. Galerie : agrandissement des photos ----------
  var lb = $('#lightbox');
  if (lb && typeof lb.showModal === 'function') {
    var lbImg = $('img', lb), lbCap = $('p', lb);
    $$('.gallery button').forEach(function(btn){
      btn.addEventListener('click', function(){
        var img = $('img', btn);
        lbImg.src = btn.getAttribute('data-full') || img.currentSrc || img.src;
        lbImg.alt = img.alt;
        lbCap.textContent = img.alt;
        lb.showModal();
      });
    });
    $('.close', lb).addEventListener('click', function(){ lb.close(); });
    lb.addEventListener('click', function(e){ if (e.target === lb) lb.close(); });
  }

  // ---------- 6. Commande ----------
  var order = $('#order-form');
  if (order) {
    var msg = $('#order-msg');
    function mode(){ var r = $('input[name="mode"]:checked', order); return r ? r.value : 'livraison'; }
    function refresh(){
      var ship = mode() === 'livraison' ? (C.fraisLivraison || 0) : 0;
      $('#r-ship').textContent = ship ? euros(ship) : 'Gratuit';
      $('#r-total').textContent = euros((C.prix || 0) + ship);
    }
    $$('input[name="mode"]', order).forEach(function(r){ r.addEventListener('change', refresh); });
    refresh();
    order.addEventListener('submit', function(e){
      e.preventDefault();
      msg.hidden = true; msg.className = 'form-msg';
      var cgv = $('#cgv');
      if (!cgv.checked) {
        msg.textContent = 'Cochez la case des conditions générales de vente pour continuer.';
        msg.classList.add('err'); msg.hidden = false; cgv.focus(); return;
      }
      var url = (C.liensPaiement || {})[mode()] || '';
      if (!/^https:\/\/(buy|checkout)\.stripe\.com\//.test(url) || /A_REMPLACER/.test(url)) {
        msg.textContent = 'Le paiement en ligne ouvre très bientôt. En attendant, écrivez-nous via le formulaire de contact pour réserver votre jeu.';
        msg.classList.add('err'); msg.hidden = false; return;
      }
      // référence de suivi (aucune donnée personnelle) transmise à Stripe
      var ref = 'site-' + mode() + '-' + Date.now().toString(36);
      location.href = url + (url.indexOf('?') < 0 ? '?' : '&') + 'client_reference_id=' + encodeURIComponent(ref);
    });
  }

  // ---------- 7. Contact : validation + anti-spam ----------
  var form = $('#contact-form');
  if (form) {
    var started = Date.now();
    var out = $('#contact-msg');
    var rules = {
      nom:     function(v){ return v.trim().length >= 2 ? '' : 'Indiquez votre nom (2 caractères minimum).'; },
      email:   function(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Cette adresse e-mail ne semble pas valide (exemple : prenom@domaine.fr).'; },
      message: function(v){ var n = v.trim().length; return n < 10 ? 'Votre message est un peu court (10 caractères minimum).' : (n > 3000 ? 'Votre message dépasse 3 000 caractères.' : ''); }
    };
    function check(field){
      var el = form.elements[field], err = $('#err-' + field), m = rules[field](el.value);
      err.textContent = m;
      el.setAttribute('aria-invalid', m ? 'true' : 'false');
      return !m;
    }
    Object.keys(rules).forEach(function(f){
      form.elements[f].addEventListener('blur', function(){ if (this.value) check(f); });
      form.elements[f].addEventListener('input', function(){ if (this.getAttribute('aria-invalid') === 'true') check(f); });
    });
    form.addEventListener('submit', function(e){
      e.preventDefault();
      out.hidden = true; out.className = 'form-msg';
      var ok = true, first = null;
      Object.keys(rules).forEach(function(f){ if (!check(f)) { ok = false; first = first || form.elements[f]; } });
      if (!ok) { first.focus(); return; }
      // anti-spam : champ piège rempli, ou envoi en moins de 3 secondes = robot
      if (form.elements.site_web.value || Date.now() - started < 3000) {
        out.textContent = 'Merci, votre message a bien été envoyé.'; out.classList.add('ok'); out.hidden = false; form.reset(); return;
      }
      if (!C.formulaireContact) {
        out.innerHTML = '';
        out.appendChild(document.createTextNode('L\'envoi depuis le site n\'est pas encore activé. Écrivez-nous directement à '));
        var b = document.createElement('strong'); b.textContent = C.emailContact || '(adresse à venir)'; out.appendChild(b);
        out.appendChild(document.createTextNode('.'));
        out.classList.add('err'); out.hidden = false; return;
      }
      var btn = $('button[type="submit"]', form); btn.disabled = true;
      fetch(C.formulaireContact, { method:'POST', headers:{'Accept':'application/json'}, body:new FormData(form) })
        .then(function(r){ if (!r.ok) throw new Error(r.status); out.textContent = 'Merci ! Votre message est bien parti, réponse sous 48 h.'; out.classList.add('ok'); form.reset(); })
        .catch(function(){ out.textContent = 'L\'envoi n\'a pas abouti. Réessayez dans un instant, ou écrivez-nous à ' + (C.emailContact || '') + '.'; out.classList.add('err'); })
        .then(function(){ out.hidden = false; btn.disabled = false; });
    });
  }
})();
