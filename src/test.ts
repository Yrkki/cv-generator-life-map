// This file is required by vitest.config.ts and loads recursively all the .spec and framework files

import { getTestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting
} from '@angular/platform-browser/testing';

// Load Plotly for tests
import Plotly from 'plotly.js';
(globalThis as any).Plotly = Plotly;

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserTestingModule,
  platformBrowserTesting(), {
  teardown: { destroyAfterEach: false }
}
);
