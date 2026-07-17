// This file is required by vitest.config.ts and loads recursively all the .spec and framework files

import { getTestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting
} from '@angular/platform-browser/testing';

// Provide a lightweight Plotly stub for tests to avoid loading the full library
const plotlyStub: any = {
  d3: {
    csv: (_url: string, callback: Function) => callback(null, [])
  },
  plot: () => {},
  Plots: {
    resize: () => {}
  }
};

(globalThis as any).Plotly = plotlyStub;

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
