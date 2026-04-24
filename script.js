(function(){
  'use strict';

  // Mobile menu
  var burger = document.querySelector('.burger');
  var nav = document.querySelector('.nav');
  if (burger && nav){
    burger.addEventListener('click', function(){
      nav.classList.toggle('open');
    });
    nav.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){ nav.classList.remove('open'); });
    });
  }

  // Header scroll shadow
  var header = document.querySelector('.site-header');
  function onScroll(){
    if (!header) return;
    if (window.scrollY > 10) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  // Phone formatter
  function formatPhone(v){
    var d = v.replace(/\D/g,'').slice(0,10);
    if (d.length < 4) return d;
    if (d.length < 7) return '(' + d.slice(0,3) + ') ' + d.slice(3);
    return '(' + d.slice(0,3) + ') ' + d.slice(3,6) + '-' + d.slice(6);
  }
  document.querySelectorAll('input[type="tel"]').forEach(function(inp){
    inp.addEventListener('input', function(e){
      e.target.value = formatPhone(e.target.value);
    });
  });

  // ZIP digits only
  document.querySelectorAll('input[data-zip]').forEach(function(inp){
    inp.addEventListener('input', function(e){
      e.target.value = e.target.value.replace(/\D/g,'').slice(0,5);
    });
  });

  // Modal
  var modal = document.getElementById('thanksModal');
  function openModal(){ if (modal){ modal.classList.add('open'); } }
  function closeModal(){ if (modal){ modal.classList.remove('open'); } }
  if (modal){
    modal.addEventListener('click', function(e){
      if (e.target === modal) closeModal();
    });
    modal.querySelectorAll('[data-close]').forEach(function(b){
      b.addEventListener('click', closeModal);
    });
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape') closeModal();
    });
  }

  // Validation helpers
  function setErr(field, on){
    if (on) field.classList.add('error');
    else field.classList.remove('error');
  }
  function validateForm(form){
    var ok = true;
    form.querySelectorAll('[data-required]').forEach(function(inp){
      var field = inp.closest('.form-field');
      var v = (inp.value || '').trim();
      var bad = false;
      if (!v) bad = true;
      else if (inp.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) bad = true;
      else if (inp.type === 'tel'){
        var d = v.replace(/\D/g,'');
        if (d.length < 10) bad = true;
      }
      else if (inp.dataset.zip !== undefined && v.length !== 5) bad = true;
      setErr(field, bad);
      if (bad) ok = false;
    });
    return ok;
  }
  function handleFormSubmit(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      if (!validateForm(form)) return;
      var btn = form.querySelector('button[type="submit"]');
      var orig = btn ? btn.textContent : '';
      if (btn){ btn.disabled = true; btn.textContent = 'Sending…'; }
      setTimeout(function(){
        form.reset();
        if (btn){ btn.disabled = false; btn.textContent = orig; }
        openModal();
      }, 700);
    });
  }
  var qf = document.getElementById('quoteForm');
  var cf = document.getElementById('contactForm');
  if (qf) handleFormSubmit(qf);
  if (cf) handleFormSubmit(cf);

  // IntersectionObserver reveals
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if (en.isIntersecting){
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, {threshold:0.12, rootMargin:'0px 0px -60px 0px'});
    reveals.forEach(function(el){ io.observe(el); });
  } else {
    reveals.forEach(function(el){ el.classList.add('in'); });
  }

  // Hash-based autofocus
  function focusFromHash(){
    var h = window.location.hash;
    if (h === '#quote'){
      var t = document.getElementById('quoteName');
      if (t) setTimeout(function(){ t.focus({preventScroll:true}); }, 400);
    } else if (h === '#estimate'){
      var c = document.getElementById('contactName');
      if (c) setTimeout(function(){ c.focus({preventScroll:true}); }, 400);
    }
  }
  window.addEventListener('load', focusFromHash);
  window.addEventListener('hashchange', focusFromHash);

  // Year in footer
  document.querySelectorAll('[data-year]').forEach(function(el){
    el.textContent = new Date().getFullYear();
  });

  // Count-up stats
  var counts = document.querySelectorAll('.rm-stat-count');
  function animateCount(el){
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var duration = 2500;
    var start = performance.now();
    function tick(now){
      var p = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.floor(target * eased);
      el.textContent = val.toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target.toLocaleString();
    }
    requestAnimationFrame(tick);
  }
  if ('IntersectionObserver' in window && counts.length){
    var co = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if (en.isIntersecting){
          animateCount(en.target);
          co.unobserve(en.target);
        }
      });
    }, {threshold:0.35});
    counts.forEach(function(el){ co.observe(el); });
  } else {
    counts.forEach(function(el){
      var t = parseInt(el.getAttribute('data-count'), 10) || 0;
      el.textContent = t.toLocaleString();
    });
  }
})();

(function(){
  var track = document.querySelector('.rm-gr-track');
  if (!track) return;
  var prevBtn = document.querySelector('.rm-gr-prev');
  var nextBtn = document.querySelector('.rm-gr-next');
  var dotsWrap = document.querySelector('.rm-gr-dots');
  var idx = 0;
  var dots = [];

  function step(){
    var card = track.querySelector('.rm-gr-card');
    if (!card) return 0;
    return card.getBoundingClientRect().width + 20;
  }
  function maxIndex(){
    var s = step();
    if (!s) return 0;
    return Math.max(0, Math.round((track.scrollWidth - track.clientWidth) / s));
  }
  function buildDots(){
    if (!dotsWrap) return;
    dotsWrap.innerHTML = '';
    dots = [];
    var n = maxIndex() + 1;
    for (var i = 0; i < n; i++){
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'rm-gr-dot';
      b.setAttribute('aria-label', 'Go to review ' + (i + 1));
      (function(i){
        b.addEventListener('click', function(){ go(i); });
      })(i);
      dotsWrap.appendChild(b);
      dots.push(b);
    }
  }
  function render(){
    var mx = maxIndex();
    if (idx > mx) idx = mx;
    if (idx < 0) idx = 0;
    track.scrollTo({ left: idx * step(), behavior: 'smooth' });
    dots.forEach(function(d, di){ d.classList.toggle('is-active', di === idx); });
    if (prevBtn) prevBtn.hidden = idx === 0;
    if (nextBtn) nextBtn.hidden = idx >= mx;
  }
  function go(i){
    idx = i;
    render();
  }
  if (prevBtn) prevBtn.addEventListener('click', function(){ go(idx - 1); });
  if (nextBtn) nextBtn.addEventListener('click', function(){ go(idx + 1); });

  buildDots();
  render();

  var rt;
  window.addEventListener('resize', function(){
    clearTimeout(rt);
    rt = setTimeout(function(){
      buildDots();
      render();
    }, 150);
  });
})();
