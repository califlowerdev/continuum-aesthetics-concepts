/* Continuum Aesthetics : Solana variant
   Motion + interaction layer. Lenis smooth scroll, GSAP ScrollTrigger reveals,
   counters, hero parallax, sliders, drawer, WhatsApp widget.
   Everything nonessential respects prefers-reduced-motion. */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  /* ---------------- Header scroll state ---------------- */
  var header = document.querySelector('.site-header');
  function onScrollHeader() {
    if (!header) return;
    if (window.scrollY > 14) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------------- Mobile drawer ---------------- */
  var toggle = document.querySelector('.nav-toggle');
  var drawer = document.getElementById('drawer');
  function closeDrawer() {
    if (!drawer || !toggle) return;
    drawer.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  if (toggle && drawer) {
    toggle.addEventListener('click', function () {
      var open = drawer.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    drawer.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeDrawer);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeDrawer();
    });
  }

  /* ---------------- WhatsApp widget ---------------- */
  var waBtn = document.querySelector('.wa-btn');
  var waPanel = document.getElementById('wa-panel');
  if (waBtn && waPanel) {
    waBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var isHidden = waPanel.hasAttribute('hidden');
      if (isHidden) waPanel.removeAttribute('hidden');
      else waPanel.setAttribute('hidden', '');
      waBtn.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
    });
    document.addEventListener('click', function (e) {
      if (!waPanel.hasAttribute('hidden') && !waPanel.contains(e.target) && e.target !== waBtn) {
        waPanel.setAttribute('hidden', '');
        waBtn.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !waPanel.hasAttribute('hidden')) {
        waPanel.setAttribute('hidden', '');
        waBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------------- Hero video: reduced motion = poster only ---------------- */
  var heroVideo = document.querySelector('.hero-video');
  if (heroVideo && reduceMotion) {
    try {
      heroVideo.pause();
      heroVideo.removeAttribute('autoplay');
    } catch (err) { /* noop */ }
  }

  /* ---------------- Testimonial slider ---------------- */
  var slider = document.querySelector('.quote-slider');
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.quote-slide'));
    var dashWrap = slider.querySelector('.quote-dashes');
    var current = 0;
    var timer = null;

    slides.forEach(function (s, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Show review ' + (i + 1) + ' of ' + slides.length);
      if (i === 0) b.classList.add('active');
      b.addEventListener('click', function () { show(i); restart(); });
      dashWrap.appendChild(b);
    });
    var dashes = Array.prototype.slice.call(dashWrap.querySelectorAll('button'));

    function show(i) {
      slides[current].classList.remove('active');
      dashes[current].classList.remove('active');
      current = (i + slides.length) % slides.length;
      slides[current].classList.add('active');
      dashes[current].classList.add('active');
    }
    function restart() {
      if (timer) clearInterval(timer);
      if (!reduceMotion) timer = setInterval(function () { show(current + 1); }, 6500);
    }
    slider.addEventListener('mouseenter', function () { if (timer) clearInterval(timer); });
    slider.addEventListener('mouseleave', restart);
    restart();
  }

  /* ---------------- Lead form: compose an email ---------------- */
  var leadForm = document.getElementById('lead-form');
  if (leadForm) {
    leadForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var get = function (name) {
        var el = leadForm.querySelector('[name="' + name + '"]');
        return el ? el.value.trim() : '';
      };
      var subject = 'Consultation inquiry from ' + (get('name') || 'the website');
      var body = 'Name: ' + get('name') +
        '\nPhone: ' + get('phone') +
        '\nEmail: ' + get('email') +
        '\nProcedure of interest: ' + get('procedure') +
        '\nPreferred contact method: ' + get('contact-method') +
        '\n\nMessage:\n' + get('message');
      window.location.href = 'mailto:info@continuumaesthetics.com?subject=' +
        encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      var note = document.getElementById('lead-form-note');
      if (note) note.textContent = 'Your email app should open with your inquiry pre-filled. Prefer not to email? Message us on WhatsApp at 786.790.9217 instead.';
    });
  }

  /* ---------------- Motion layer ---------------- */
  if (reduceMotion || !hasGsap) {
    if (!hasGsap) document.documentElement.classList.add('gsap-failed');
    // Make sure nothing stays hidden if GSAP never loaded.
    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    // Counters: set final values immediately.
    document.querySelectorAll('[data-count]').forEach(function (el) {
      el.textContent = el.getAttribute('data-count');
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* Lenis smooth scroll, wired into the GSAP ticker */
  var lenis = null;
  if (typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ duration: 1.05, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);

    // Anchor links route through Lenis so offsets stay correct.
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (id.length > 1 && document.querySelector(id)) {
          e.preventDefault();
          lenis.scrollTo(id, { offset: -120 });
        }
      });
    });
  }

  /* fadeInUp reveal language, staggered per section */
  var groups = {};
  document.querySelectorAll('[data-reveal]').forEach(function (el) {
    var section = el.closest('section, footer, header') || document.body;
    var key = section.dataset.revealKey || (section.dataset.revealKey = 'g' + Math.random().toString(36).slice(2));
    (groups[key] = groups[key] || []).push(el);
  });
  Object.keys(groups).forEach(function (key) {
    var els = groups[key];
    els.forEach(function (el, i) {
      gsap.fromTo(el,
        { opacity: 0, y: 26 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
          delay: (i % 6) * 0.07,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true }
        });
    });
  });

  /* Subtle hero parallax */
  var heroMedia = document.querySelector('.hero .hero-media-left .hero-video, .hero .hero-media-left .hero-media-img');
  var heroLeft = document.querySelector('.hero-media-left');
  if (heroMedia && heroLeft) {
    gsap.to(heroMedia, {
      yPercent: 7,
      ease: 'none',
      scrollTrigger: { trigger: heroLeft, start: 'top top', end: 'bottom top', scrub: true }
    });
  }
  var heroPhotoImg = document.querySelector('.hero-photo img');
  if (heroPhotoImg) {
    gsap.to(heroPhotoImg, {
      yPercent: -6,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
  }
  var ctaBg = document.querySelector('.cta-banner .cta-bg');
  if (ctaBg) {
    gsap.to(ctaBg, {
      yPercent: 8,
      ease: 'none',
      scrollTrigger: { trigger: '.cta-banner', start: 'top bottom', end: 'bottom top', scrub: true }
    });
  }

  /* Ghost word drift */
  var ghost = document.querySelector('.ghost-word');
  if (ghost) {
    gsap.fromTo(ghost, { xPercent: -56 }, {
      xPercent: -44,
      ease: 'none',
      scrollTrigger: { trigger: ghost.parentElement, start: 'top bottom', end: 'bottom top', scrub: true }
    });
  }

  /* Stat counters */
  document.querySelectorAll('[data-count]').forEach(function (el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var decimals = (el.getAttribute('data-count').split('.')[1] || '').length;
    var obj = { v: 0 };
    gsap.to(obj, {
      v: target,
      duration: 1.6,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: function () { el.textContent = obj.v.toFixed(decimals); },
      onComplete: function () { el.textContent = el.getAttribute('data-count'); }
    });
  });
})();
