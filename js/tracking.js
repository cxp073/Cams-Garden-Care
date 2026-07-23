/* Cam's Garden Care — GA4 event tracking for contact clicks.
 *
 * A single delegated click listener that fires named GA4 events for WhatsApp
 * and phone clicks. This ADDS to — and never replaces — the Google Ads click
 * conversions already wired up in /contact-buttons.js. Both listeners run on
 * the same click: the Ads one fires gtag('event','conversion',{send_to:'AW-…'}),
 * this one fires the named GA4 event routed explicitly to the GA4 property.
 *
 * There is deliberately no gtag('config','G-…') here or in any page. The base
 * gtag.js (AW-18188133016) loaded in each page's <head> fans out to GA4
 * (G-1GBY5BTE39) via shared destinations configured in Google's UI, not in page
 * code, so a config call would only duplicate page_view collection. Because a
 * page's default gtag destination is the Ads tag, every event below routes to
 * GA4 explicitly with send_to so it can't be dropped.
 *
 * Fire-and-forget: never preventDefault, never delay navigation. If the hit is
 * lost on a slow connection, that's acceptable. Guarded with typeof gtag so a
 * blocked analytics script can't throw and break the page. Plain ES5, no deps.
 */
(function () {
  "use strict";

  var GA4_ID = "G-1GBY5BTE39";

  /* source_page derived from the pathname: strip leading/trailing slashes and a
   * trailing .html, and use "home" for the root path. */
  function derivedPage() {
    var path = window.location.pathname
      .replace(/^\/+|\/+$/g, "")
      .replace(/\.html$/, "");
    return path === "" ? "home" : path;
  }

  /* source_page, in priority order:
   *   1. the link's own data-page attribute, if present
   *   2. the hidden Formspree source_page field on the page, if one exists — so
   *      click events report the same value the form_submit event does
   *   3. derived from location.pathname */
  function sourcePage(link) {
    var dp = link.getAttribute("data-page");
    if (dp) return dp;
    var hidden = document.querySelector(
      'form.contact-form input[name="source_page"]'
    );
    if (hidden && hidden.value) return hidden.value;
    return derivedPage();
  }

  function fireEvent(eventName, link) {
    if (typeof gtag !== "function") return;
    gtag("event", eventName, {
      send_to: GA4_ID,
      source_page: sourcePage(link),
      service: link.getAttribute("data-service") || "general",
      cta_location: link.getAttribute("data-cta") || "unknown"
    });
  }

  document.addEventListener("click", function (e) {
    if (!e.target || !e.target.closest) return;
    var wa = e.target.closest(
      'a[href*="wa.me"], a[href*="api.whatsapp.com"]'
    );
    if (wa) {
      fireEvent("whatsapp_click", wa);
      return;
    }
    var tel = e.target.closest('a[href^="tel:"]');
    if (tel) {
      fireEvent("phone_click", tel);
    }
  });
})();
