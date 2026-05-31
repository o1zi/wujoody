/* ============================================================
   Scroll engine — re-runnable (works across client-side navigation).
   Exposes window.__WUJOOD_ENGINE(): initializes on the current DOM and
   returns a destroy() that cancels rAF/listeners. A React runtime calls it
   on mount and tears it down on unmount, so it works after Back navigation.
   ============================================================ */
(function () {
  'use strict';

  window.__WUJOOD_ENGINE = function init() {
    var canvas = document.getElementById('bgCanvas');
    var video = document.getElementById('bgVideo');
    var bgImage = document.getElementById('bgImage');
    var ctx = canvas ? canvas.getContext('2d', { alpha: false }) : null;
    var useVideo = !!video;
    var useImage = !!bgImage;

    var loader = document.getElementById('loader');
    var loaderBar = document.querySelector('#loader .bar i');
    var loaderLbl = document.querySelector('#loader .lbl');
    var topbar = document.getElementById('topbar');
    var hudFill = document.getElementById('hudFill');
    var hudPct = document.getElementById('hudPct');
    var docEl = document.documentElement;

    var SMOOTH = 0.12;
    window.AWTAD_setSmooth = function (v) { SMOOTH = v; };

    var N = 160;
    var frames = new Array(N);
    var started = false, killed = false, rafId = 0, tTimer = 0, safetyTimer = 0;
    var maxScroll = 1, progress = 0, target = 0, cur = 0, lastDrawn = -1;
    var PAD = function (n) { return String(n).padStart(3, '0'); };

    function setLoader(p, label) {
      if (loaderBar) { loaderBar.style.animation = 'none'; loaderBar.style.width = Math.round(p * 100) + '%'; }
      if (loaderLbl) loaderLbl.textContent = (label || 'PREPARING THE SITE') + ' · ' + Math.round(p * 100) + '%';
    }

    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var cw = 0, ch = 0;
    function sizeCanvas() {
      if (!canvas || !ctx) return;
      cw = window.innerWidth; ch = window.innerHeight;
      canvas.width = Math.round(cw * dpr); canvas.height = Math.round(ch * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawFrame(lastDrawn < 0 ? 0 : lastDrawn);
    }
    function drawCover(src) {
      if (!ctx || !src) return;
      var iw = src.videoWidth || src.width, ih = src.videoHeight || src.height;
      if (!iw || !ih) return;
      var scale = Math.max(cw / iw, ch / ih);
      var w = iw * scale, h = ih * scale;
      ctx.drawImage(src, (cw - w) / 2, (ch - h) / 2, w, h);
    }
    function drawFrame(idx) {
      var img = frames[idx];
      if (!img || !(img.width || img.videoWidth)) return;
      drawCover(img);
      lastDrawn = idx;
    }

    function preloadImages() {
      var custom = (window.__BG_FRAMES__ && window.__BG_FRAMES__.length) ? window.__BG_FRAMES__ : null;
      N = custom ? custom.length : 160;
      frames = new Array(N);
      var loaded = 0;
      for (var i = 0; i < N; i++) {
        (function (i) {
          var img = new Image();
          img.onload = img.onerror = function () {
            loaded++;
            setLoader(loaded / N);
            if (loaded === N) start();
          };
          img.src = custom ? custom[i] : ('/site-template/assets/frames/f' + PAD(i) + '.jpg');
          frames[i] = img;
        })(i);
      }
    }

    function startVideoMode() {
      video.muted = true;
      video.playsInline = true;
      var go = function () { start(); };
      if (video.readyState >= 2) go();
      else {
        video.addEventListener('loadeddata', go, { once: true });
        video.addEventListener('canplay', go, { once: true });
        video.addEventListener('error', go, { once: true });
      }
      try { var p = video.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {}
      setTimeout(go, 2500);
    }

    function measure() { maxScroll = Math.max(1, docEl.scrollHeight - window.innerHeight); }
    function readScroll() {
      var y = window.pageYOffset || docEl.scrollTop || 0;
      progress = Math.min(1, Math.max(0, y / maxScroll));
      target = progress * (N - 1);
      if (topbar) { if (y > 60) topbar.classList.add('solid'); else topbar.classList.remove('solid'); }
      var pc = Math.round(progress * 100);
      if (hudFill) hudFill.style.width = pc + '%';
      if (hudPct) hudPct.innerHTML = 'نسبة الإنشاء <b>' + String(pc).padStart(3, '0') + '%</b>';
      updateDots(y);
      checkReveal();
    }
    function loop() {
      if (killed) return;
      if (ctx && !useVideo && !useImage) {
        var d = target - cur;
        if (Math.abs(d) > 0.001) cur += d * SMOOTH; else cur = target;
        var idx = Math.round(cur);
        if (idx < 0) idx = 0; if (idx > N - 1) idx = N - 1;
        if (idx !== lastDrawn) drawFrame(idx);
      }
      rafId = requestAnimationFrame(loop);
    }

    var reveals = [];
    function checkReveal() {
      var trig = window.innerHeight * 0.86;
      for (var i = reveals.length - 1; i >= 0; i--) {
        if (reveals[i].getBoundingClientRect().top < trig) { reveals[i].classList.add('in'); reveals.splice(i, 1); }
      }
    }
    function runCounter(el) {
      var tgt = parseFloat(el.getAttribute('data-count'));
      var dec = (el.getAttribute('data-dec') | 0);
      var t0 = null, dur = 1700;
      function step(ts) {
        if (killed) return;
        if (!t0) t0 = ts; var p = Math.min(1, (ts - t0) / dur); var e = 1 - Math.pow(1 - p, 3);
        el.textContent = dec ? (tgt * e).toFixed(dec) : Math.round(tgt * e).toLocaleString('en-US');
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    var counters = [];
    function checkCounters() {
      var trig = window.innerHeight * 0.82;
      for (var i = counters.length - 1; i >= 0; i--) {
        if (counters[i].getBoundingClientRect().top < trig) { runCounter(counters[i]); counters.splice(i, 1); }
      }
    }

    var dots = [].slice.call(document.querySelectorAll('.dots button'));
    var sections = [];
    function updateDots(y) {
      var mid = y + window.innerHeight * 0.4, active = 0;
      sections.forEach(function (s, i) { if (s && s.offsetTop <= mid) active = i; });
      dots.forEach(function (b, i) { b.classList.toggle('active', i === active); });
    }
    dots.forEach(function (b) {
      b.addEventListener('click', function () {
        var t = document.getElementById(b.dataset.target);
        if (t) window.scrollTo({ top: t.id === 'hero' ? 0 : t.offsetTop, behavior: 'smooth' });
      });
    });

    [].slice.call(document.querySelectorAll('[data-goto]')).forEach(function (a) {
      a.addEventListener('click', function (ev) {
        ev.preventDefault();
        var t = document.getElementById(a.dataset.goto);
        if (t) window.scrollTo({ top: a.dataset.goto === 'hero' ? 0 : t.offsetTop, behavior: 'smooth' });
        document.body.classList.remove('nav-open');
      });
    });
    var mb = document.getElementById('menuBtn');
    if (mb) mb.addEventListener('click', function () { document.body.classList.toggle('nav-open'); });

    (function () {
      var slides = [].slice.call(document.querySelectorAll('.t-slide'));
      if (!slides.length) return; var idx = 0;
      function show(n) { idx = (n + slides.length) % slides.length; slides.forEach(function (s, i) { s.classList.toggle('on', i === idx); }); }
      var p = document.getElementById('tPrev'), nx = document.getElementById('tNext');
      if (p) p.addEventListener('click', function () { show(idx - 1); });
      if (nx) nx.addEventListener('click', function () { show(idx + 1); });
      tTimer = setInterval(function () { show(idx + 1); }, 7000);
    })();

    function start() {
      if (started || killed) return; started = true;
      if (loader) loader.classList.add('done');
      docEl.classList.add('ready');
      sizeCanvas();
      rafId = requestAnimationFrame(loop);
    }

    function onScroll() { readScroll(); checkCounters(); }
    function onResize() { measure(); sizeCanvas(); }

    reveals = [].slice.call(document.querySelectorAll('.reveal'));
    counters = [].slice.call(document.querySelectorAll('[data-count]'));
    sections = dots.map(function (b) { return document.getElementById(b.dataset.target); });
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    sizeCanvas();
    readScroll(); checkReveal(); checkCounters();
    if (useVideo) startVideoMode();
    else if (useImage) start();
    else preloadImages();
    safetyTimer = setTimeout(start, 14000);

    return function destroy() {
      killed = true;
      if (rafId) cancelAnimationFrame(rafId);
      if (tTimer) clearInterval(tTimer);
      if (safetyTimer) clearTimeout(safetyTimer);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      docEl.classList.remove('ready');
    };
  };
})();
