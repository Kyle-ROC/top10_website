
(function () {
  "use strict";

  var THEME_KEY = "top10-theme";
  var LIKES_KEY = "top10-likes";

  /* ---------------------------------------------------
     1. THEME TOGGLE — persists across every page
     --------------------------------------------------- */
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    var toggles = document.querySelectorAll("[data-theme-toggle]");
    toggles.forEach(function (btn) {
      btn.setAttribute("aria-checked", theme === "light" ? "true" : "false");
      var knobLabel = btn.querySelector(".knob");
      if (knobLabel) knobLabel.textContent = theme === "light" ? "☀" : "☾";
    });
  }

  function initTheme() {
    var saved = localStorage.getItem(THEME_KEY) || "dark";
    applyTheme(saved);

    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var current = document.documentElement.getAttribute("data-theme") || "dark";
        var next = current === "light" ? "dark" : "light";
        localStorage.setItem(THEME_KEY, next);
        applyTheme(next);
      });
    });
  }

  /* ---------------------------------------------------
     2. ALBUM CAROUSELS — one per artist page
     --------------------------------------------------- */
  function initCarousels() {
    document.querySelectorAll(".carousel").forEach(function (carousel) {
      var track = carousel.querySelector(".carousel-track");
      var viewport = carousel.querySelector(".carousel-viewport");
      var prevBtn = carousel.querySelector(".car-prev");
      var nextBtn = carousel.querySelector(".car-next");
      var dotsWrap = carousel.querySelector(".car-dots");
      if (!track || !viewport) return;

      var cards = Array.prototype.slice.call(track.children);
      var index = 0;

      function cardsPerView() {
        var w = viewport.clientWidth;
        var cardWidth = cards[0] ? cards[0].getBoundingClientRect().width + 18 : 228;
        return Math.max(1, Math.floor(w / cardWidth));
      }

      function maxIndex() {
        return Math.max(0, cards.length - cardsPerView());
      }

      function renderDots() {
        if (!dotsWrap) return;
        dotsWrap.innerHTML = "";
        var total = maxIndex() + 1;
        for (var i = 0; i < total; i++) {
          var dot = document.createElement("span");
          dot.className = "car-dot" + (i === index ? " active" : "");
          dotsWrap.appendChild(dot);
        }
      }

      function update() {
        var cardWidth = cards[0] ? cards[0].getBoundingClientRect().width + 18 : 228;
        track.style.transform = "translateX(-" + index * cardWidth + "px)";
        if (prevBtn) prevBtn.disabled = index === 0;
        if (nextBtn) nextBtn.disabled = index >= maxIndex();
        renderDots();
      }

      if (prevBtn) prevBtn.addEventListener("click", function () {
        index = Math.max(0, index - 1);
        update();
      });
      if (nextBtn) nextBtn.addEventListener("click", function () {
        index = Math.min(maxIndex(), index + 1);
        update();
      });

      window.addEventListener("resize", function () {
        index = Math.min(index, maxIndex());
        update();
      });

      update();
    });
  }

  /* ---------------------------------------------------
     3. SHOW MORE / DETAIL REVEAL
     --------------------------------------------------- */
  function initReveals() {
    document.querySelectorAll("[data-reveal-btn]").forEach(function (btn) {
      var targetId = btn.getAttribute("data-reveal-btn");
      var panel = document.getElementById(targetId);
      if (!panel) return;

      btn.addEventListener("click", function () {
        var isOpen = panel.classList.toggle("open");
        btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
        var label = btn.querySelector(".label-text");
        if (label) label.textContent = isOpen ? "Show less" : "Show more";
        if (isOpen) {
          panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      });
    });
  }

  /* ---------------------------------------------------
     4. ALBUM LIKES — persists per album across visits
     --------------------------------------------------- */
  function getLikesStore() {
    try {
      return JSON.parse(localStorage.getItem(LIKES_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function saveLikesStore(store) {
    localStorage.setItem(LIKES_KEY, JSON.stringify(store));
  }

  function initLikes() {
    var store = getLikesStore();

    document.querySelectorAll("[data-album-id]").forEach(function (btn) {
      var id = btn.getAttribute("data-album-id");
      var baseCount = parseInt(btn.getAttribute("data-base-count") || "0", 10);
      var countEl = btn.querySelector(".like-count");
      var liked = !!store[id];

      function render() {
        btn.classList.toggle("liked", liked);
        btn.setAttribute("aria-pressed", liked ? "true" : "false");
        if (countEl) countEl.textContent = baseCount + (liked ? 1 : 0);
      }
      render();

      btn.addEventListener("click", function () {
        liked = !liked;
        store[id] = liked;
        saveLikesStore(store);
        render();
        btn.classList.remove("pulse");
        if (liked) {
          void btn.offsetWidth; /* restart animation */
          btn.classList.add("pulse");
        }
      });
    });
  }

  /* ---------------------------------------------------
     5. BACK TO TOP
     --------------------------------------------------- */
  function initBackToTop() {
    var btn = document.querySelector("[data-back-to-top]");
    if (!btn) return;

    function onScroll() {
      var scrolled = window.scrollY || document.documentElement.scrollTop;
      var trigger = window.innerHeight * 0.8;
      btn.classList.toggle("visible", scrolled > trigger);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    onScroll();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initTheme();
    initCarousels();
    initReveals();
    initLikes();
    initBackToTop();
  });
})();
