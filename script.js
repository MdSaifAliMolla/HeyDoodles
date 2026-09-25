// HeyDoodles — monochrome. App cards + copy-to-snackbar + reveal. Tailwind inplace.
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    loadCards();
    initCopy();
    initReveal();
  });

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  async function loadCards() {
    var list = document.getElementById("app-list");
    if (!list) return;
    try {
      var res = await fetch("../apps.json");
      var data = await res.json();
      list.innerHTML = (data.apps || []).map(card).join("");
    } catch (e) {
      list.innerHTML = card({
        name: "PiTorrent",
        description: "Torrent client for Android.",
        path: "pitorrent/"
      });
    }
    initReveal();
  }

  function card(a) {
    // apps.json stores root-relative paths ("apps/pitorrent/") but this
    // card only renders on the /apps/ page, so strip the prefix.
    var href = String(a.path || "").replace(/^(?:\.\/)?apps\//, "");
    return (
      '<a href="' + esc(href) + '" class="reveal group flex items-center gap-5 border-t border-black/15 py-6 no-underline opacity-0 translate-y-[18px] transition-[opacity,transform] duration-700 ease-out motion-reduce:opacity-100 motion-reduce:translate-y-0 motion-reduce:transition-none last:border-b">' +
        '<span><span class="block font-display text-[clamp(24px,3vw,34px)] font-semibold tracking-[-0.02em] group-hover:underline group-hover:decoration-pi group-hover:underline-offset-[5px]">' + esc(a.name) + "</span>" +
        '<p class="mb-0 mt-1 text-base text-muted">' + esc(a.description || a.tagline || "") + "</p></span>" +
        '<span aria-hidden="true" class="ml-auto shrink-0 text-[26px] font-black text-muted group-hover:text-ink">→</span>' +
      "</a>"
    );
  }

  var snackTimer = null;
  function showSnackbar(text) {
    var bar = document.getElementById("snackbar");
    if (!bar) return;
    bar.textContent = text;
    bar.classList.remove("translate-y-[80px]", "opacity-0");
    bar.classList.add("translate-y-0", "opacity-100");
    clearTimeout(snackTimer);
    snackTimer = setTimeout(function () {
      bar.classList.add("translate-y-[80px]", "opacity-0");
      bar.classList.remove("translate-y-0", "opacity-100");
    }, 2500);
  }

  function initCopy() {
    document.querySelectorAll("[data-copy]").forEach(function (el) {
      el.addEventListener("click", function () {
        var text = el.dataset.copy;
        if (navigator.clipboard) navigator.clipboard.writeText(text).catch(function () {});
        showSnackbar("Copied " + text);
      });
    });
  }

  var io = null;
  function initReveal() {
    var els = document.querySelectorAll(".reveal:not(.is-in)");
    if (!els.length) return;
    var show = function (el) {
      el.classList.remove("opacity-0", "translate-y-[18px]");
      el.classList.add("opacity-100", "translate-y-0", "is-in");
    };
    if (!("IntersectionObserver" in window)) {
      els.forEach(show);
      return;
    }
    if (!io) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { show(en.target); io.unobserve(en.target); }
        });
      }, { threshold: 0.1 });
    }
    els.forEach(function (el) { io.observe(el); });
  }
})();
