/* Continuum Aesthetics. Variant "Current".
   Motion: Lenis smooth scroll + GSAP ScrollTrigger reveals, parallax, counters.
   Everything nonessential is wrapped in a prefers-reduced-motion guard. */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = typeof window.gsap !== "undefined";
  var hasST = hasGsap && typeof window.ScrollTrigger !== "undefined";
  var lenis = null;

  /* ---------------------------------------------------- smooth scroll */

  if (!reduceMotion && typeof window.Lenis !== "undefined") {
    lenis = new window.Lenis({
      duration: 1.15,
      smoothWheel: true
    });
    if (hasST) {
      lenis.on("scroll", window.ScrollTrigger.update);
      window.gsap.ticker.add(function (time) {
        lenis.raf(time * 1000);
      });
      window.gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        lenis.raf(time);
        window.requestAnimationFrame(raf);
      }
      window.requestAnimationFrame(raf);
    }
  }

  /* Smooth-scroll for same-page anchors (works with or without Lenis) */
  document.addEventListener("click", function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;
    var id = link.getAttribute("href");
    if (id.length < 2) return;
    var target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    closeDrawer();
    if (lenis) {
      lenis.scrollTo(target, { offset: -90 });
    } else {
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    }
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  });

  /* ------------------------------------------------------------ header */

  var header = document.querySelector(".site-header");
  function onScrollHeader() {
    if (!header) return;
    if (window.scrollY > 80) {
      header.classList.add("solid");
    } else {
      header.classList.remove("solid");
    }
  }
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  /* ----------------------------------------------------- mobile drawer */

  var navToggle = document.querySelector(".nav-toggle");
  var drawer = document.querySelector(".mobile-drawer");

  function closeDrawer() {
    if (!drawer || !navToggle) return;
    drawer.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    if (lenis) lenis.start();
  }

  if (navToggle && drawer) {
    navToggle.addEventListener("click", function () {
      var open = drawer.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
      if (lenis) { open ? lenis.stop() : lenis.start(); }
    });
    drawer.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeDrawer);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeDrawer();
    });
  }

  /* ----------------------------------------------- announcement rotate */

  var announce = document.querySelector(".announce-msg");
  if (announce) {
    var messages = [
      announce.innerHTML,
      'Physician-led &middot; 5.0 on Google from 30 reviews',
      'Text, WhatsApp or call: <a href="tel:+17867909217">786.790.9217</a>',
      'By appointment only &middot; 175 SW 7th St, Suite 1411'
    ];
    var mi = 0;
    if (!reduceMotion) {
      setInterval(function () {
        mi = (mi + 1) % messages.length;
        announce.style.opacity = "0";
        setTimeout(function () {
          announce.innerHTML = messages[mi];
          announce.style.opacity = "1";
        }, 350);
      }, 5200);
      announce.style.transition = "opacity 0.35s ease";
    }
  }

  /* --------------------------------------------------- reveal system */

  var revealEls = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));

  if (!reduceMotion && hasST && revealEls.length) {
    window.gsap.registerPlugin(window.ScrollTrigger);
    revealEls.forEach(function (el) {
      var delay = parseFloat(el.getAttribute("data-reveal-delay") || "0");
      window.gsap.fromTo(
        el,
        { opacity: 0, y: 26 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          delay: delay,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 86%", once: true }
        }
      );
    });

    /* staggered groups: children animate in sequence */
    document.querySelectorAll("[data-reveal-group]").forEach(function (group) {
      var kids = group.children;
      window.gsap.fromTo(
        kids,
        { opacity: 0, y: 26 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.09,
          ease: "power2.out",
          scrollTrigger: { trigger: group, start: "top 84%", once: true }
        }
      );
    });

    /* image scale-in for media cards */
    document.querySelectorAll("[data-reveal-scale] img").forEach(function (img) {
      window.gsap.fromTo(
        img,
        { scale: 1.12 },
        {
          scale: 1,
          duration: 1.4,
          ease: "power2.out",
          scrollTrigger: { trigger: img, start: "top 88%", once: true }
        }
      );
    });
  }

  /* ------------------------------------------------------ hero parallax */

  var heroMedia = document.querySelector(".hero-media");
  if (!reduceMotion && hasST && heroMedia) {
    window.gsap.to(heroMedia, {
      yPercent: 16,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });
    var heroContent = document.querySelector(".hero-content");
    if (heroContent) {
      window.gsap.to(heroContent, {
        yPercent: -8,
        opacity: 0.35,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom 30%",
          scrub: true
        }
      });
    }
  }

  /* --------------------------------------------------------- counters */

  var counters = document.querySelectorAll("[data-count]");
  if (counters.length) {
    var animateCount = function (el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var decimals = (el.getAttribute("data-count").split(".")[1] || "").length;
      var suffix = el.getAttribute("data-suffix") || "";
      if (reduceMotion || !hasGsap) {
        el.textContent = target.toFixed(decimals) + suffix;
        return;
      }
      var proxy = { v: 0 };
      window.gsap.to(proxy, {
        v: target,
        duration: 1.8,
        ease: "power3.out",
        onUpdate: function () {
          el.textContent = proxy.v.toFixed(decimals) + suffix;
        }
      });
    };
    if ("IntersectionObserver" in window) {
      var seen = new WeakSet();
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !seen.has(entry.target)) {
            seen.add(entry.target);
            animateCount(entry.target);
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });
      counters.forEach(function (el) { io.observe(el); });
    } else {
      counters.forEach(animateCount);
    }
  }

  /* --------------------------------------------------- concern selector */

  document.querySelectorAll(".concern-card").forEach(function (card) {
    var trigger = card.querySelector(".concern-trigger");
    var body = card.querySelector(".concern-body");
    if (!trigger || !body) return;
    trigger.addEventListener("click", function () {
      var isOpen = card.classList.contains("open");
      /* close siblings for a tidy accordion feel */
      card.parentElement.querySelectorAll(".concern-card.open").forEach(function (other) {
        if (other !== card) {
          other.classList.remove("open");
          other.querySelector(".concern-body").style.maxHeight = "0px";
          other.querySelector(".concern-trigger").setAttribute("aria-expanded", "false");
        }
      });
      if (isOpen) {
        card.classList.remove("open");
        body.style.maxHeight = "0px";
        trigger.setAttribute("aria-expanded", "false");
      } else {
        card.classList.add("open");
        body.style.maxHeight = body.scrollHeight + "px";
        trigger.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ----------------------------------------------------- review slider */

  var track = document.querySelector(".review-track");
  if (track) {
    var prev = document.querySelector(".review-prev");
    var next = document.querySelector(".review-next");
    var step = function () {
      var card = track.querySelector(".review-card");
      return card ? card.getBoundingClientRect().width + 20 : 360;
    };
    if (prev) prev.addEventListener("click", function () {
      track.scrollBy({ left: -step(), behavior: reduceMotion ? "auto" : "smooth" });
    });
    if (next) next.addEventListener("click", function () {
      track.scrollBy({ left: step(), behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* -------------------------------------------------- shimmer skeletons */

  document.querySelectorAll(".media-card img, .cat-card img").forEach(function (img) {
    var done = function () {
      var sh = img.closest(".media-card, .cat-card");
      if (sh) {
        var s = sh.querySelector(".shimmer");
        if (s) s.classList.add("done");
      }
    };
    if (img.complete && img.naturalWidth > 0) { done(); }
    else {
      img.addEventListener("load", done);
      img.addEventListener("error", done);
    }
  });

  /* ----------------------------------------------------- whatsapp float */

  var waToggle = document.querySelector(".wa-toggle");
  var waPanel = document.querySelector(".wa-panel");
  if (waToggle && waPanel) {
    waToggle.addEventListener("click", function () {
      var open = waPanel.classList.toggle("open");
      waToggle.setAttribute("aria-expanded", open ? "true" : "false");
      waPanel.setAttribute("aria-hidden", open ? "false" : "true");
    });
    document.addEventListener("click", function (e) {
      if (!waPanel.classList.contains("open")) return;
      if (!e.target.closest(".wa-float")) {
        waPanel.classList.remove("open");
        waToggle.setAttribute("aria-expanded", "false");
        waPanel.setAttribute("aria-hidden", "true");
      }
    });
  }

  /* ----------------------------------------- treatments side nav active */

  var sideLinks = document.querySelectorAll(".treat-sidenav a[href^='#']");
  if (sideLinks.length && "IntersectionObserver" in window) {
    var map = {};
    sideLinks.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = map[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          sideLinks.forEach(function (a) { a.classList.remove("active"); });
          link.classList.add("active");
        }
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) spy.observe(el);
    });
  }

  /* ----------------------------------------------- footer year safety */
  var yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = "2026";
})();
