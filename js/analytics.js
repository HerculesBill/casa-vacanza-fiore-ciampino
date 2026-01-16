// Simple, safe analytics placeholder.
// Add your GA4 Measurement ID (G-XXXXXXXXXX) and/or Google Ads ID (AW-XXXXXXXXX) when ready.

(() => {
  const GA4_ID = ""; // e.g. "G-XXXXXXXXXX"
  const ADS_ID = ""; // e.g. "AW-XXXXXXXXX"

  // Optional Google Ads conversion labels
  const ADS_LABEL_BOOKING = "";
  const ADS_LABEL_DIRECT = "";

  const PRIMARY_ID = GA4_ID || ADS_ID;
  if (!PRIMARY_ID) return; // No IDs yet: do nothing.

  // Load gtag.js
  const gtagScript = document.createElement("script");
  gtagScript.async = true;
  gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(PRIMARY_ID)}`;
  document.head.appendChild(gtagScript);

  // Init gtag
  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  gtag("js", new Date());
  if (GA4_ID) gtag("config", GA4_ID, { anonymize_ip: true });
  if (ADS_ID) gtag("config", ADS_ID);

  const safeEvent = (name, params) => {
    try {
      if (typeof window.gtag === "function") window.gtag("event", name, params || {});
    } catch (_) {}
  };

  const safeConversion = (sendTo) => {
    try {
      if (ADS_ID && sendTo && typeof window.gtag === "function") {
        window.gtag("event", "conversion", { send_to: sendTo });
      }
    } catch (_) {}
  };

  const init = () => {
    // Track outbound clicks to main booking channels
    document.querySelectorAll('a[href]').forEach((a) => {
      const href = a.getAttribute('href') || '';
      const isBooking = href.includes('booking.com');
      const isAirbnb = href.includes('airbnb.');
      const isVrbo = href.includes('vrbo.com');
      const isMailto = href.startsWith('mailto:');

      if (!(isBooking || isAirbnb || isVrbo || isMailto)) return;

      a.addEventListener('click', () => {
        let domain = 'other';
        if (isBooking) domain = 'booking.com';
        if (isAirbnb) domain = 'airbnb';
        if (isVrbo) domain = 'vrbo.com';
        if (isMailto) domain = 'mailto';

        safeEvent('outbound_click', {
          link_domain: domain,
          link_url: href,
        });

        // Optional Ads conversion for booking clicks
        if ((isBooking || isAirbnb || isVrbo) && ADS_ID && ADS_LABEL_BOOKING) {
          safeConversion(`${ADS_ID}/${ADS_LABEL_BOOKING}`);
        }
      }, { passive: true });
    });

    // Track direct booking form submit (lead)
    const form = document.getElementById('directBookingForm');
    if (form) {
      form.addEventListener('submit', () => {
        safeEvent('generate_lead', { method: 'direct_booking_form' });
        if (ADS_ID && ADS_LABEL_DIRECT) {
          safeConversion(`${ADS_ID}/${ADS_LABEL_DIRECT}`);
        }
      });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
