/* Cam's Garden Care — tap-to-message + tap-to-call buttons.
 *
 * Single source of truth for the WhatsApp/Call button pair. Each page adds a
 * mount point (<div data-contact-buttons></div>) and loads this script once;
 * the markup below is injected into every mount so it's never hand-copied.
 *
 * Attribution note: these buttons deliberately do NOT carry the gclid. The
 * Formspree form remains the attribution path for paid leads — these are for
 * ease of contact. See the gtag note in fireClick() below.
 */
(function () {
  "use strict";

  var WHATSAPP_URL = "https://wa.me/447713924067?text=Hi%20Cam%2C%20I'd%20like%20to%20ask%20about%20lawn%20care";
  var TEL_URL = "tel:+447713924067";

  var WHATSAPP_ICON =
    '<svg class="cb-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
    '<path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.87 9.87 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.91-7.01zM12.04 20.15h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.23 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.98-.14.16-.29.18-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43-.14-.01-.31-.01-.48-.01-.16 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.23-.17-.48-.29z"/>' +
    '</svg>';

  var PHONE_ICON =
    '<svg class="cb-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
    '<path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>' +
    '</svg>';

  function markup() {
    return (
      '<a class="cb-btn cb-whatsapp" href="' + WHATSAPP_URL + '" target="_blank" rel="noopener" ' +
        'aria-label="Message Cam on WhatsApp" data-cb-method="whatsapp">' +
        WHATSAPP_ICON + '<span>WhatsApp</span>' +
      '</a>' +
      '<a class="cb-btn cb-call" href="' + TEL_URL + '" ' +
        'aria-label="Call Cam" data-cb-method="call">' +
        PHONE_ICON + '<span>Call Cam</span>' +
      '</a>'
    );
  }

  function fireClick(method) {
    /* Count WhatsApp/Call taps in Google Ads (account AW-18188133016) so this
     * route can be measured alongside form submits. This is a plain event, not
     * a conversion: the form keeps its dedicated conversion label for paid-lead
     * attribution and these buttons carry no gclid.
     *
     * TODO: if Cam wants taps to count as a *conversion*, create a "Contact
     * click" conversion action in the Ads account and add its label here, e.g.
     *   gtag('event', 'conversion', { send_to: 'AW-18188133016/<LABEL>' });
     */
    if (typeof gtag === "function") {
      gtag("event", "contact_click", { method: method, send_to: "AW-18188133016" });
    }
  }

  function init() {
    var mounts = document.querySelectorAll("[data-contact-buttons]");
    if (!mounts.length) return;

    for (var i = 0; i < mounts.length; i++) {
      var el = mounts[i];
      el.classList.add("contact-buttons");
      el.innerHTML = markup();
    }

    var buttons = document.querySelectorAll(".contact-buttons .cb-btn");
    for (var j = 0; j < buttons.length; j++) {
      (function (btn) {
        btn.addEventListener("click", function () {
          fireClick(btn.getAttribute("data-cb-method"));
        });
      })(buttons[j]);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
