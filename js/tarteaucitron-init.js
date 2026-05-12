/* Tarteaucitron — Sky Social Agency
   Cookie consent manager (CNIL-compliant)
   Loads Google Analytics only after explicit user consent. */
(function () {
  if (typeof tarteaucitron === 'undefined') return;

  tarteaucitron.init({
    privacyUrl: 'https://www.skysocial.fr/politique-de-confidentialite.html',
    bodyPosition: 'bottom',
    hashtag: '#tarteaucitron',
    cookieName: 'skysocial_consent',
    orientation: 'bottom',
    groupServices: false,
    showDetailsOnClick: true,
    serviceDefaultState: 'wait',
    showAlertSmall: false,
    cookieslist: true,
    closePopup: false,
    showIcon: false,
    iconPosition: 'BottomRight',
    adblocker: false,
    DenyAllCta: true,
    AcceptAllCta: true,
    highPrivacy: true,
    handleBrowserDNTRequest: true,
    removeCredit: false,
    moreInfoLink: true,
    useExternalCss: false,
    useExternalJs: false,
    readmoreLink: 'https://www.skysocial.fr/politique-de-confidentialite.html',
    mandatory: true,
    mandatoryCta: true
  });

  // Google Analytics (gtag) — loaded ONLY after consent.
  tarteaucitron.user.gtagUa = 'G-FXDDXQ0CRP';
  tarteaucitron.user.gtagMore = function () { /* extra GA config if needed */ };
  (tarteaucitron.job = tarteaucitron.job || []).push('gtag');
})();
