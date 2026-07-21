// This file is required by vitest.config.ts and loads recursively all the .spec and framework files

import { getTestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting
} from '@angular/platform-browser/testing';

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  try {
    Object.defineProperty(document, 'baseURI', {
      value: 'http://localhost/',
      configurable: true
    });
  } catch {
    // ignore if baseURI is not configurable in this environment
  }
}

// Load Plotly from npm in the browser-like test environment.
const loadPlotlyFromNpm = async () => {
  if (typeof window === 'undefined' || !('document' in window)) return null;
  if ((window as any).Plotly) return (window as any).Plotly;

  const plotlyModule = await import('plotly.js/dist/plotly-geo.min.js');
  const plotly = (plotlyModule as any).default ?? plotlyModule;
  if (plotly) {
    (window as any).Plotly = plotly;
  }
  return plotly;
};

const plotlyFromNpm = await loadPlotlyFromNpm();
(globalThis as any).Plotly = plotlyFromNpm ?? null;

// Mark which Plotly implementation is active so tests / Playwright can detect it
(globalThis as any).__PLOTLY_SOURCE = plotlyFromNpm ? 'npm' : null;
(globalThis as any).__PLOTLY_VERSION = (plotlyFromNpm && (plotlyFromNpm as any).version) || null;
if (typeof console !== 'undefined' && console.info) {
  console.info('[tests] Plotly source:', (globalThis as any).__PLOTLY_SOURCE, 'version:', (globalThis as any).__PLOTLY_VERSION);
}

// Instrument Plotly.plot to record whether a real plot call happened during tests.
try {
  const p = (globalThis as any).Plotly;
  if (p) {
    p._test_plotCalled = false;
    const orig = p.plot;
    p.plot = (...args: any[]) => {
      try { p._test_plotCalled = true; } catch { }
      return orig?.apply(p, args);
    };
  }
} catch {
  // ignore instrumentation errors
}

// First, initialize the Angular testing environment (idempotent).
try {
  getTestBed().initTestEnvironment(
    BrowserTestingModule,
    platformBrowserTesting(), {
    teardown: { destroyAfterEach: false }
  }
  );
} catch (e) {
  // Environment already initialized by another runner; ignore.
}
