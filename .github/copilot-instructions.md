# AI Coding Agent Instructions for cv-generator-life-map

## Project Overview
A geographic data visualization frontend for the LifeSpan ecosystem. Displays country-level market data on an interactive world map using Plotly.js within an Angular application. Deployed to Heroku with New Relic monitoring.

## Architecture & Key Patterns

### Tech Stack
- **Framework:** Angular 17+ (latest, using zoneless change detection)
- **Language:** TypeScript (ES2022 target, strict mode enabled)
- **Styling:** SCSS
- **Visualization:** Plotly.js (loaded via CDN in Karma tests)
- **Runtime:** Node.js, Express server for static hosting
- **Build:** Angular CLI with Webpack
- **Testing:** Jasmine + Karma
- **Deployment:** Heroku with semantic-release

### Application Structure
- **Root Component:** [src/app/app.component.ts](src/app/app.component.ts) - singleton map visualizer
  - Uses `@ViewChild` to reference native DOM element for Plotly rendering
  - `AfterViewInit` lifecycle hook to initialize map after view ready
  - `@HostListener` for window resize and print events
- **Routing:** [src/app/app-routing.module.ts](src/app/app-routing.module.ts) - currently empty (single-page app)
- **Module:** [src/app/app.module.ts](src/app/app.module.ts) - uses `provideZonelessChangeDetection()` for performance
- **Data Source:** [src/assets/countries.csv](src/assets/countries.csv) - country names mapped to "Weight" values

### Data Flow
1. Component loads countries.csv via Plotly's d3.csv parser
2. CSV rows unpacked into arrays (country names → locations, weights → z-values)
3. Choropleth map created with Robinson projection, centered on Europe (lon:35, lat:52)
4. Custom color scale: royal blue (0) → plum (1) for country weights

### TypeScript Strictness
- `strict: true` enabled (no implicit any)
- `noPropertyAccessFromIndexSignature: false` (allow CSV row bracket access)
- `noImplicitOverride: true` (explicit `override` keyword required)
- `fullTemplateTypeCheck: true` (strict Angular templates)
- Global `Plotly` object accessed via `globalThis` type casting

## Critical Workflows

### Development
```bash
npm install --legacy-peer-deps  # Required: legacy peer dependencies
npm run serve                    # ng serve on localhost:4200
npm run watch                    # ng build with watch mode
npm run open:local               # ng serve --open
```

### Testing
```bash
npm test                         # Jasmine + Karma (runs snyk test first)
npm run lint                     # ng lint (@angular-eslint)
npm run e2e                      # Protractor end-to-end tests
```

### Building & Deployment
```bash
npm run build                    # Production build to dist/
npm run buildfast                # Faster build (no source maps, stats json)
npm run heroku-postbuild         # Runs npm run build (Heroku hook)
npm start                        # Node server on port 5000 (or $PORT)
```

### Package Updates
```bash
npm run dev:plan:update:report:action:update-packages
# Runs: install → ng update → npm-check-updates -u
```

### Server Runtime
- [server.js](server.js) handles Express static file serving
- Redirects HTTP→HTTPS (except localhost/192.168.1.2)
- Enables compression middleware
- Serves [src/index.html](src/index.html) for HTML5Mode routing
- Heroku integration: listens on `process.env.PORT || 5000`
- New Relic APM enabled via `newrelic.js`

## Project-Specific Conventions

### Linting & Code Style
- ESLint with `@angular-eslint` schematics (configured in angular.json)
- SCSS as default component styling (not CSS)
- Max lines per function: commented with `/* eslint-disable max-lines-per-function */`
- No TypeScript default exports in module files

### Component Patterns
- Components use standalone or module-based declarations (check imports/declarations in spec)
- Direct DOM access via `@ViewChild('ref') templateRef!: ElementRef<HTMLElement>`
- Always use strict null assertion (!) on ViewChild; initialize in AfterViewInit
- Host listeners use `@HostListener('event', ['$event'])` for window events

### Testing Patterns
- **Setup:** `TestBed.configureTestingModule({ imports: [...], declarations: [...] })`
- **Fixture:** `TestBed.createComponent()` creates component instance
- **Detection:** Explicit `fixture.detectChanges()` for change detection
- **Async:** Use `async()` wrapper for async TestBed setup
- **External deps:** Plotly loaded via CDN in karma.conf.js `files` array

### Build Configuration
- Production budgets: 500KB initial, 1MB error (see angular.json)
- Component styles: 2KB warning, 4KB error
- Source maps: enabled in development, disabled with `buildfast`
- Output hashing: all files for production cache-busting
- Service Worker: enabled in production (`ngsw-config.json`)

## Integration Points

### External Dependencies
- **Plotly.js:** Loaded via CDN (`https://cdn.plot.ly/plotly-latest.min.js`)
  - Used for choropleth visualization; global access via `globalThis.Plotly`
  - d3.csv used for CSV parsing
- **Angular Router:** Configured but no routes currently (route array is empty)
- **New Relic APM:** Integrated in server.js and newrelic.js for monitoring

### Release Process
- **Semantic Versioning:** Angular Conventional Commits parser
- **Breaking Changes:** Detected via BREAKING CHANGE keywords
- **Automated Releases:** @semantic-release plugins handle npm publish, changelog, git push
- **Branch:** Only `master` branch triggers releases

## Common Pitfalls & Notes
- CSV must include "Country" (for locations) and "Weight" (for z values) columns
- Plotly element ref (`this.map.nativeElement`) must exist before calling `plotly.plot()`
- Resize events manually call `plotly.Plots.resize()` to prevent layout distortion
- Use `--legacy-peer-deps` during npm install due to Angular/dependency version mismatches
- Heroku PORT env var controls server listen port; defaults to 5000 locally
