import { analytics } from '../data/analytics';

type Consent = 'granted' | 'denied';
declare global {
  interface Window {
    dataLayer?: IArguments[];
    gtag?: (...args: unknown[]) => void;
    [key: `ga-disable-${string}`]: boolean | undefined;
  }
}

export function initAnalytics() {
  // A production build can also run on localhost or a Cloudflare preview URL.
  if (!import.meta.env.PROD || location.protocol !== 'https:' || !analytics.hostnames.includes(location.hostname)) return;

  const banner = document.getElementById('analytics-consent');
  if (!banner) return;

  const ga = window;
  const consentKey = 'z08-analytics-consent';
  const disableKey = `ga-disable-${analytics.measurementId}` as const;
  let loaded = false;
  let returnFocus: HTMLElement | null = null;

  function readConsent(): Consent | null {
    const match = document.cookie.split('; ').find(cookie => cookie.startsWith(`${consentKey}=`));
    const value = match?.slice(consentKey.length + 1);
    return value === 'granted' || value === 'denied' ? value : null;
  }

  function loadAnalytics() {
    if (loaded) return;
    loaded = true;
    ga[disableKey] = false;
    ga.dataLayer = ga.dataLayer || [];
    ga.gtag = function () { ga.dataLayer!.push(arguments); };
    ga.gtag('consent', 'default', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
    ga.gtag('js', new Date());
    ga.gtag('config', analytics.measurementId, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_domain: location.hostname,
      cookie_expires: 60 * 60 * 24 * 180,
      cookie_flags: 'SameSite=Lax;Secure',
    });
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${analytics.measurementId}`;
    document.head.append(script);
  }

  function clearAnalyticsCookies() {
    for (const cookie of document.cookie.split('; ')) {
      const name = cookie.split('=')[0];
      if (name !== '_ga' && !name.startsWith('_ga_')) continue;
      for (const domain of ['', location.hostname, 'z08studio.com']) {
        document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax; Secure${domain ? `; Domain=${domain}` : ''}`;
      }
    }
  }

  function chooseConsent(consent: Consent) {
    document.cookie = `${consentKey}=${consent}; Max-Age=${60 * 60 * 24 * 180}; Path=/; SameSite=Lax; Secure`;
    if (consent === 'granted') {
      loadAnalytics();
    } else {
      ga[disableKey] = true;
      clearAnalyticsCookies();
      // Stop an already loaded tag and its event listeners after withdrawing consent.
      if (loaded) {
        location.reload();
        return;
      }
    }
    banner!.hidden = true;
    const focusTarget = returnFocus || document.getElementById('main');
    if (focusTarget) {
      if (!returnFocus) focusTarget.setAttribute('tabindex', '-1');
      focusTarget.focus({ preventScroll: true });
    }
  }

  banner.querySelectorAll<HTMLButtonElement>('[data-consent]').forEach(button => {
    button.addEventListener('click', () => chooseConsent(button.dataset.consent as Consent));
  });

  document.querySelectorAll<HTMLButtonElement>('[data-analytics-settings]').forEach(button => {
    button.hidden = false;
    button.addEventListener('click', () => {
      returnFocus = button;
      banner.hidden = false;
      banner.querySelector<HTMLButtonElement>('[data-consent]')?.focus();
    });
  });

  const consent = readConsent();
  if (consent === 'granted') loadAnalytics();
  else {
    ga[disableKey] = true;
    banner.hidden = consent === 'denied';
  }
}
