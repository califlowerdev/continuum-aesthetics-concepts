/* Continuum Aesthetics, Meridian concept. Motion kit: quiet by design. */
(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = typeof window.gsap !== "undefined";
  var hasScrollTrigger = typeof window.ScrollTrigger !== "undefined";
  var hasLenis = typeof window.Lenis !== "undefined";

  /* ----- Smooth scroll (Lenis), disabled for reduced motion ----- */
  var lenis = null;
  if (!reducedMotion && hasLenis) {
    lenis = new window.Lenis({ duration: 1.05, smoothWheel: true });
    if (hasGsap && hasScrollTrigger) {
      lenis.on("scroll", window.ScrollTrigger.update);
      window.gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      window.gsap.ticker.lagSmoothing(0);
    } else {
      var raf = function (time) { lenis.raf(time); window.requestAnimationFrame(raf); };
      window.requestAnimationFrame(raf);
    }
  }

  /* ----- Anchor links keep working with Lenis ----- */
  document.addEventListener("click", function (e) {
    var link = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!link) return;
    var id = link.getAttribute("href");
    if (id.length < 2) return;
    var target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    if (lenis) { lenis.scrollTo(target, { offset: -110 }); }
    else { target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" }); }
    closeDrawer();
  });

  /* ----- Header shadow on scroll ----- */
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ----- Mobile drawer ----- */
  var toggle = document.querySelector(".nav-toggle");
  var drawer = document.querySelector(".mobile-drawer");
  function closeDrawer() {
    if (!toggle || !drawer) return;
    toggle.setAttribute("aria-expanded", "false");
    drawer.classList.remove("is-open");
    document.body.style.overflow = "";
  }
  if (toggle && drawer) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      drawer.classList.toggle("is-open", !open);
      document.body.style.overflow = open ? "" : "hidden";
    });
    drawer.addEventListener("click", function (e) {
      if (e.target.tagName === "A") closeDrawer();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { closeDrawer(); closeWaPanel(); }
    });
  }

  /* ----- WhatsApp float ----- */
  var waToggle = document.querySelector(".wa-toggle");
  var waPanel = document.querySelector(".wa-panel");
  function closeWaPanel() {
    if (!waToggle || !waPanel) return;
    waPanel.classList.remove("is-open");
    waToggle.setAttribute("aria-expanded", "false");
  }
  if (waToggle && waPanel) {
    waToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = waPanel.classList.toggle("is-open");
      waToggle.setAttribute("aria-expanded", String(open));
    });
    document.addEventListener("click", function (e) {
      if (waPanel.classList.contains("is-open") && !waPanel.contains(e.target) && e.target !== waToggle) {
        closeWaPanel();
      }
    });
  }

  /* ----- Reveal system ----- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
  if (reducedMotion || !hasGsap || !hasScrollTrigger) {
    document.documentElement.classList.add("reveal-ready");
  } else {
    window.gsap.registerPlugin(window.ScrollTrigger);
    var groups = {};
    reveals.forEach(function (el) {
      var key = el.getAttribute("data-reveal-group");
      if (key) {
        (groups[key] = groups[key] || []).push(el);
      } else {
        window.gsap.fromTo(el,
          { opacity: 0, y: 24 },
          {
            opacity: 1, y: 0, duration: 0.7, ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 88%", once: true }
          });
      }
    });
    Object.keys(groups).forEach(function (key) {
      var els = groups[key];
      window.gsap.fromTo(els,
        { opacity: 0, y: 24 },
        {
          opacity: 1, y: 0, duration: 0.7, ease: "power2.out", stagger: 0.06,
          scrollTrigger: { trigger: els[0], start: "top 88%", once: true }
        });
    });

    /* ----- Subtle hero parallax ----- */
    var heroMedia = document.querySelector(".hero-media");
    if (heroMedia) {
      window.gsap.to(heroMedia, {
        yPercent: 12, ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
      });
    }
  }

  /* ----- Stat counters ----- */
  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));
  function renderCount(el, value, decimals) {
    el.textContent = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString();
  }
  counters.forEach(function (el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = (el.getAttribute("data-count").split(".")[1] || "").length;
    if (reducedMotion || !hasGsap || !hasScrollTrigger) {
      renderCount(el, target, decimals);
      return;
    }
    var state = { v: 0 };
    window.gsap.to(state, {
      v: target, duration: 1.6, ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 90%", once: true },
      onUpdate: function () { renderCount(el, state.v, decimals); }
    });
  });

  /* ----- Review slider ----- */
  var slider = document.querySelector(".review-slider");
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".review-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".review-dot"));
    var index = 0;
    var timer = null;
    function show(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach(function (s, n) { s.classList.toggle("is-active", n === index); });
      dots.forEach(function (d, n) {
        d.classList.toggle("is-active", n === index);
        d.setAttribute("aria-pressed", String(n === index));
      });
    }
    function play() {
      if (reducedMotion) return;
      timer = window.setInterval(function () { show(index + 1); }, 6500);
    }
    dots.forEach(function (d, n) {
      d.addEventListener("click", function () {
        window.clearInterval(timer);
        show(n);
        play();
      });
    });
    show(0);
    play();
  }

  /* ----- Hero video: pause when reduced motion ----- */
  var heroVideo = document.querySelector(".hero-media video");
  if (heroVideo && reducedMotion) {
    heroVideo.removeAttribute("autoplay");
    heroVideo.pause();
  }

  /* ----- Lead form: compose an email (static concept, no backend) ----- */
  var leadForm = document.getElementById("lead-form");
  if (leadForm) {
    leadForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var get = function (name) {
        var f = leadForm.querySelector('[name="' + name + '"]');
        return f ? f.value.trim() : "";
      };
      var subject = "Consultation request from " + (get("name") || "the website");
      var lines = [
        "Name: " + get("name"),
        "Phone: " + get("phone"),
        "Email: " + get("email"),
        "Procedure of interest: " + get("procedure"),
        "Preferred contact method: " + get("contact_method"),
        "",
        get("message")
      ];
      window.location.href = "mailto:info@continuumaesthetics.com?subject=" +
        encodeURIComponent(subject) + "&body=" + encodeURIComponent(lines.join("\n"));
    });
  }

  /* ----- Footer year ----- */
  var yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = new Date().getFullYear().toString();
})();
