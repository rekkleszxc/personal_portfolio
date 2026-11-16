export type Attribution = {
  source: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  referrer?: string;
  landing_page?: string;
  page_url?: string;
};

const STORAGE_KEY = "portfolio:first-touch";

type FirstTouch = {
  referrer?: string;
  landing_page?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
};

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

function readFirstTouch(): FirstTouch {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as FirstTouch;
  } catch {
    // sessionStorage can be unavailable in private modes.
  }

  const params = new URLSearchParams(window.location.search);
  const touch: FirstTouch = {
    landing_page: window.location.pathname + window.location.search,
    referrer: document.referrer || undefined,
  };
  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) touch[key] = value.slice(0, 120);
  }

  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(touch));
  } catch {
    // Ignore storage failures; attribution still works for this submit.
  }
  return touch;
}

function externalReferrerHost(referrer: string): string | null {
  try {
    const url = new URL(referrer);
    if (url.host === window.location.host) return null;
    return url.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function readAttribution(): Attribution {
  if (typeof window === "undefined") return { source: "direct" };
  const touch = readFirstTouch();
  const referrerHost = touch.referrer
    ? externalReferrerHost(touch.referrer)
    : null;
  return {
    ...touch,
    source: touch.utm_source ?? referrerHost ?? "direct",
    page_url: window.location.pathname + window.location.search,
  };
}
