export const analytics = {
  // Public browser configuration, supplied at build time. Never put secrets here.
  measurementId: import.meta.env.PUBLIC_GOOGLE_ANALYTICS_ID?.trim() || '',
  hostnames: ['z08studio.com', 'www.z08studio.com'],
};

export const analyticsEnabled = /^G-[A-Z0-9]+$/.test(analytics.measurementId);
