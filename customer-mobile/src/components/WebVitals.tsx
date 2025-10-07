'use client';

import { useEffect } from 'react';

export function WebVitals() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const reportWebVitals = async () => {
      const { onCLS, onINP, onFCP, onLCP, onTTFB } = await import('web-vitals');

      onCLS((metric) => {
        console.log('[Web Vitals] CLS:', metric.value.toFixed(4));
      });

      onINP((metric) => {
        console.log('[Web Vitals] INP:', metric.value.toFixed(2), 'ms');
      });

      onFCP((metric) => {
        console.log('[Web Vitals] FCP:', metric.value.toFixed(2), 'ms');
      });

      onLCP((metric) => {
        console.log('[Web Vitals] LCP:', metric.value.toFixed(2), 'ms');
      });

      onTTFB((metric) => {
        console.log('[Web Vitals] TTFB:', metric.value.toFixed(2), 'ms');
      });
    };

    reportWebVitals();
  }, []);

  return null;
}
