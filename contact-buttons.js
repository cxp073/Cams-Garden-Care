/* Cam's Garden Care — tap-to-message + tap-to-call buttons.
 *
 * Single source of truth for the WhatsApp/Call button pair. Each page adds a
 * mount point (<div data-contact-buttons></div>) and loads this script once;
 * the markup below is injected into every mount so it's never hand-copied.
 *
 * Attribution note: these buttons deliberately do NOT carry the gclid. The
 * Formspree form remains the attribution path for paid leads — these are for
 * ease of contact. Click-conversion tracking is delegated once in
 * initClickTracking() below (get_a_mow / whatsapp_click / call_click).
 */
(function () {
  "use strict";

  var TEL_URL = "tel:+447713924067";
  var WA_BASE = "https://wa.me/447713924067";

  /* Page-aware sticky-bar CTA tracking hook. The hero/contact primary CTA has
   * been removed, so IS_GARDEN_PAGE now drives only the sticky CTA's Ads
   * tracking class (its visible label and aria-label are both fixed strings set
   * in stickyMarkup): the garden-work page fires the shared whatsapp_click
   * conversion via .cb-whatsapp, every other page keeps .js-get-a-mow. The
   * class is a tracking hook only — no styling. */
  var IS_GARDEN_PAGE = /\/hedges-garden-work(\/|\/index\.html)?$/.test(
    window.location.pathname
  );
  var CTA_TRACK_CLASS = IS_GARDEN_PAGE ? "cb-whatsapp" : "js-get-a-mow";

  /* Per-page WhatsApp prefill + GA4 service tag for the injected buttons,
   * mirroring the per-page text now carried by the hardcoded links. The prefill
   * replaces the previous baked-in wordings (get-a-mow / garden-help / ask-about
   * -lawn-care); IS_GARDEN_PAGE wins where it and the pathname map would
   * disagree. Exactly one ?text= is built from WA_BASE + the encoded page text
   * (encodeURIComponent → %20 for spaces, %2C for commas), so no button ends up
   * with a second text param. data-service feeds the GA4 whatsapp_click /
   * phone_click events read by /js/tracking.js. */
  function pageContact() {
    if (IS_GARDEN_PAGE) {
      return { service: "hedge", text: "Hi Cam, I'm enquiring about hedges and garden work" };
    }
    var p = window.location.pathname
      .replace(/^\/+|\/+$/g, "")
      .replace(/\.html$/, "");
    if (p === "garforth") {
      return { service: "lawn", text: "Hi Cam, I'm enquiring about lawn mowing in Garforth" };
    }
    if (p === "kippax") {
      return { service: "lawn", text: "Hi Cam, I'm enquiring about lawn mowing in Kippax" };
    }
    if (p === "lawn-renovation") {
      return { service: "renovation", text: "Hi Cam, I'm enquiring about lawn renovation" };
    }
    if (p === "lawn-care-plans") {
      return { service: "lawn", text: "Hi Cam, I'm enquiring about a lawn care plan" };
    }
    if (p === "lawn-feeding-seaweed") {
      return { service: "lawn", text: "Hi Cam, I'm enquiring about lawn feeding" };
    }
    /* home and anything else → general */
    return { service: "general", text: "Hi Cam, I'm enquiring about lawn and garden care" };
  }
  var PAGE = pageContact();
  /* Every injected WhatsApp button invites a postcode so the visitor only has to
   * add that (square brackets literal, matching the old locked wording). Built
   * from WA_BASE, so each href still has exactly one ?text=. */
  var WA_URL = WA_BASE + "?text=" + encodeURIComponent(PAGE.text + ". I'm in [postcode]");
  var WA_SERVICE = PAGE.service;

  var WHATSAPP_ICON =
    '<svg class="cb-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
    '<path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.87 9.87 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.91-7.01zM12.04 20.15h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.23 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.98-.14.16-.29.18-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43-.14-.01-.31-.01-.48-.01-.16 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.23-.17-.48-.29z"/>' +
    '</svg>';

  var PHONE_ICON =
    '<svg class="cb-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
    '<path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>' +
    '</svg>';

  /* loc = the GA4 cta_location for the buttons in this mount (hero / footer /
   * mid), resolved from where the mount sits on the page. */
  function markup(loc) {
    var attrs = ' data-service="' + WA_SERVICE + '" data-cta="' + loc + '"';
    /* In the hero, WhatsApp is the lead action: cb-get-a-mow gives it the solid
     * full-width fill (Call drops beneath as the outline secondary, via the
     * .hero .contact-buttons .cb-call rule in styles.css), matching the
     * hardcoded garforth/hedges heroes. In the contact section it stays an equal
     * member of the outline pair beside Call. */
    var waClass = loc === "hero" ? "cb-btn cb-get-a-mow cb-whatsapp" : "cb-btn cb-whatsapp";
    return (
      '<a class="' + waClass + '" href="' + WA_URL + '" target="_blank" rel="noopener"' + attrs + ' ' +
        'aria-label="Message Cam on WhatsApp">' +
        WHATSAPP_ICON + '<span>WhatsApp</span>' +
      '</a>' +
      '<a class="cb-btn cb-call" href="' + TEL_URL + '"' + attrs + ' ' +
        'aria-label="Call Cam">' +
        PHONE_ICON + '<span>Call Cam</span>' +
      '</a>'
    );
  }

  function init() {
    var mounts = document.querySelectorAll("[data-contact-buttons]");
    if (!mounts.length) return;

    for (var i = 0; i < mounts.length; i++) {
      var el = mounts[i];
      el.classList.add("contact-buttons");
      /* cta_location by where the mount lives: the hero header, the contact
       * section near the foot of the page, or anywhere else (mid). */
      var loc =
        el.closest && el.closest(".hero")
          ? "hero"
          : el.closest && el.closest(".contact")
          ? "footer"
          : "mid";
      el.innerHTML = markup(loc);
    }
    /* Click-conversion tracking is delegated (see initClickTracking below), so
     * no per-button listeners are wired here. */
  }

  /* Site header nav: on narrow phones the four links collapse behind a
   * "Menu" toggle. Marking the nav .is-js hands control to this script; the
   * no-JS fallback (see styles.css) simply stacks the links so they never
   * wrap awkwardly. */
  function initNav() {
    var navs = document.querySelectorAll(".site-nav");
    for (var i = 0; i < navs.length; i++) {
      (function (nav) {
        nav.classList.add("is-js");
        var btn = nav.querySelector(".site-nav-toggle");
        if (!btn) return;
        btn.addEventListener("click", function () {
          var open = nav.classList.toggle("is-open");
          btn.setAttribute("aria-expanded", open ? "true" : "false");
        });
      })(navs[i]);
    }
  }

  /* ---- Condensed sticky header (Guardian-style) -------------------------
   * Injected here so every page gets the same bar with zero per-page markup.
   * Hidden on arrival; fades in once the top nav panel scrolls out of view
   * (IntersectionObserver on .site-nav, falling back to .hero, then to a
   * ~200px scroll threshold). Left: green wordmark linking home. Right: a
   * keyboard- and screen-reader-accessible "Services" dropdown. Hrefs reuse
   * the pages' existing URLs. */
  var STICKY_LINKS = [
    ["/lawn-care-plans/", "Lawn care plans"],
    ["/lawn-feeding-seaweed/", "Lawn feeding"],
    ["/lawn-renovation/", "Lawn renovation"],
    ["/hedges-garden-work/", "Garden work &amp; hedges"],
    ["/#areas", "Areas"],
    ["#contact", "Contact"]
  ];

  function stickyMarkup() {
    var items = "";
    for (var i = 0; i < STICKY_LINKS.length; i++) {
      items +=
        '<li role="none"><a role="menuitem" href="' + STICKY_LINKS[i][0] + '">' +
        STICKY_LINKS[i][1] + "</a></li>";
    }
    return (
      '<div class="sticky-bar-inner">' +
        '<a class="sticky-logo" href="/" aria-label="Cam\'s Garden Care home">' +
          '<img src="/images/cams-logo-green.svg" alt="Cam\'s Garden Care" width="144" height="28">' +
        "</a>" +
        '<div class="sticky-actions">' +
        '<a class="sticky-cta ' + CTA_TRACK_CLASS + '" href="' + WA_URL + '" target="_blank" rel="noopener" ' +
          'data-service="' + WA_SERVICE + '" data-cta="sticky" aria-label="Message Cam on WhatsApp">Message Cam</a>' +
        '<div class="sticky-services">' +
          '<button class="sticky-services-btn" type="button" aria-haspopup="true" ' +
            'aria-expanded="false" aria-controls="sticky-services-menu">' +
            'Services <span class="sticky-chevron" aria-hidden="true">▾</span>' +
          "</button>" +
          '<ul class="sticky-services-menu" id="sticky-services-menu" role="menu" ' +
            'aria-label="Services" hidden>' + items + "</ul>" +
        "</div>" +
        "</div>" +
      "</div>"
    );
  }

  function initStickyHeader() {
    if (document.querySelector(".sticky-bar")) return;

    var bar = document.createElement("div");
    bar.className = "sticky-bar";
    bar.innerHTML = stickyMarkup();
    document.body.insertBefore(bar, document.body.firstChild);

    var btn = bar.querySelector(".sticky-services-btn");
    var menu = bar.querySelector(".sticky-services-menu");

    function openMenu() {
      menu.hidden = false;
      btn.setAttribute("aria-expanded", "true");
      bar.classList.add("menu-open");
    }
    function closeMenu() {
      menu.hidden = true;
      btn.setAttribute("aria-expanded", "false");
      bar.classList.remove("menu-open");
    }
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (menu.hidden) openMenu(); else closeMenu();
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeMenu();
    });
    document.addEventListener("click", function (e) {
      if (!bar.contains(e.target)) closeMenu();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !menu.hidden) { closeMenu(); btn.focus(); }
    });

    function reveal(on) {
      if (on) {
        bar.classList.add("is-visible");
      } else {
        bar.classList.remove("is-visible");
        closeMenu();
      }
    }

    var target = document.querySelector(".site-nav") || document.querySelector(".hero");
    if (target && "IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        reveal(!entries[0].isIntersecting);
      }, { threshold: 0 });
      io.observe(target);
    } else {
      var onScroll = function () {
        var y = window.pageYOffset || document.documentElement.scrollTop;
        reveal(y > 200);
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
  }

  /* ---- Click-conversion tracking for every contact button --------------
   * One delegated listener on <document> maps each contact button to its own
   * named gtag event. The base tag (AW-18188133016) is already loaded in each
   * page's <head>, so this only ADDS events — it never reinstalls the tag.
   *
   *   .js-get-a-mow  -> get_a_mow      (hero, sticky bar, burger nav)
   *   .cb-whatsapp   -> whatsapp_click (hero)
   *   .cb-call       -> call_click     (hero)
   *
   * Delegation means one physical tap fires exactly one event, wherever the
   * button appears — no per-instance listeners, no double-firing.
   *
   * Google Ads counts a click-conversion only when the gtag event is named
   * "conversion" and send_to carries the conversion label, so each button
   * fires gtag('event','conversion',{send_to:...}) with the label below. The
   * second column is kept purely as a human-readable id for which button
   * fired. This mirrors the form submit in each page's <head>, which sends to
   * 'AW-18188133016/KVI3COH5sLwcEJjF4-BD'. */
  var CLICK_EVENTS = [
    /* [ selector, button id (for reference), Ads conversion send_to ] */
    /* Every surviving .js-get-a-mow element opens WhatsApp (like .cb-whatsapp),
       so it records the same WhatsApp conversion rather than a separate label.
       The button id stays "get_a_mow" for readability in the event log. */
    [".js-get-a-mow", "get_a_mow", "AW-18188133016/gvbNCKTk_cscEJjF4-BD"],
    [".cb-whatsapp", "whatsapp_click", "AW-18188133016/gvbNCKTk_cscEJjF4-BD"],
    [".cb-call", "call_click", "AW-18188133016/yQl_CKrk_cscEJjF4-BD"]
  ];

  function fireContactEvent(name, sendTo) {
    if (typeof gtag !== "function" || !sendTo) return;
    /* gtag ships the hit via navigator.sendBeacon, so it survives the page
     * unloading when a tel: link opens the dialer; wa.me links open in a new
     * tab and never unload this page. Either way the event fires before
     * navigation and is not lost — no preventDefault needed. */
    gtag("event", "conversion", { send_to: sendTo });
  }

  function initClickTracking() {
    document.addEventListener("click", function (e) {
      if (!e.target || !e.target.closest) return;
      for (var i = 0; i < CLICK_EVENTS.length; i++) {
        if (e.target.closest(CLICK_EVENTS[i][0])) {
          fireContactEvent(CLICK_EVENTS[i][1], CLICK_EVENTS[i][2]);
          return; /* one tap = one event */
        }
      }
    });
  }

  function boot() {
    init();
    initNav();
    initStickyHeader();
    initClickTracking();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
