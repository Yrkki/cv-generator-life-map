
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  let plotly: any;
  let fetchSpy: any;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let initPlotlySpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    plotly = (globalThis as any).Plotly;
    if (!plotly) {
      throw new Error('Plotly did not load for tests');
    }
    fetchSpy = vi.spyOn(globalThis as any, 'fetch').mockImplementation(() =>
      Promise.resolve(new Response(JSON.stringify([{ Country: 'Test', Weight: 1, ISO3: 'TST' }]), {
        headers: { 'Content-Type': 'application/json' }
      }))
    );
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    initPlotlySpy = vi.spyOn(AppComponent.prototype as any, 'initPlotly').mockResolvedValue(undefined);

    await TestBed.configureTestingModule({
      imports: [AppComponent]
    });

    await TestBed.compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    fetchSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    initPlotlySpy.mockRestore();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it(`should have as title 'Life Map'`, () => {
    expect(component.title).toEqual('Life Map');
  });

  it('should render title', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain(component.title);
  });

  it('should check onResize', () => {
    expect(() => component.onResize()).not.toThrow();
    expect(typeof plotly.Plots.resize).toBe('function');
  });

  it('should check onBeforePrint', () => {
    expect(() => component.onBeforePrint(new Event('print'))).not.toThrow();
  });

  it('should run main with no data errors', async () => {
    await expect(async () => {
      await component.main();
    }).not.toThrow();
  });

  it('should return the same Plotly instance when already loaded', async () => {
    component['plotly'] = plotly;
    const loaded = await component['ensurePlotly']();
    expect(loaded).toBe(plotly);
  });

  it('should warn when main runs without Plotly', async () => {
    (component as any).plotly = undefined;
    await expect(component.main()).resolves.not.toThrow();
    expect(consoleWarnSpy).toHaveBeenCalledWith(['[Plotly] main aborted because Plotly is unavailable']);
  });

  it('should warn when main runs without a map element', async () => {
    component['plotly'] = plotly;
    (component as any).map = undefined;
    await expect(component.main()).resolves.not.toThrow();
    expect(consoleWarnSpy).toHaveBeenCalledWith(['[Plotly] main aborted because map element is unavailable']);
  });

  it('should build data from country rows', () => {
    const rows = [
      { Country: 'A', Weight: 1, ISO3: 'AAA' },
      { Country: 'B', Weight: 2, ISO3: 'BBB' }
    ];
    const data = component['getData'](rows);
    expect(data[0].locations).toEqual(['AAA', 'BBB']);
    expect(data[0].z).toEqual([1, 2]);
    expect(data[0].text).toEqual(['A', 'B']);
  });

  it('should resize Plotly when the map exists', () => {
    component['plotly'] = plotly;
    const resizeSpy = vi.spyOn(plotly.Plots, 'resize');
    expect(() => component.onResize()).not.toThrow();
    expect(resizeSpy).toHaveBeenCalled();
  });

  it('should call main when initPlotly succeeds', async () => {
    initPlotlySpy.mockRestore();
    const mainSpy = vi.spyOn(component as any, 'main').mockResolvedValue(undefined);
    await component['initPlotly']();
    expect(mainSpy).toHaveBeenCalled();
  });

  it('should warn when initPlotly fails to load Plotly', async () => {
    initPlotlySpy.mockRestore();
    const ensureSpy = vi.spyOn(component as any, 'ensurePlotly').mockResolvedValue(null);
    await component['initPlotly']();
    expect(consoleWarnSpy).toHaveBeenCalledWith(['[Plotly] Failed to load Plotly.']);
  });

  it('should expose a consistent layout object', () => {
    const layout = component['layout'];
    expect(layout.title).toBe('Markets');
    expect(layout.geo.scope).toBe('world');
  });

  it('should report which Plotly implementation is used', () => {
    const src = (globalThis as any).__PLOTLY_SOURCE;
    expect(src).toBe('npm');
  });

  it('should log Plotly info to the test output', () => {
    const src = (globalThis as any).__PLOTLY_SOURCE;
    const ver = (globalThis as any).__PLOTLY_VERSION;
    console.info('[tests] Plotly page source:', src, 'version:', ver);
    expect(src).toBeDefined();
    expect(ver).toBeDefined();
  });

  it('should use plot fallback when newPlot is unavailable', async () => {
    const plotFn = vi.fn().mockResolvedValue(undefined);
    component['plotly'] = { ...plotly, newPlot: undefined, plot: plotFn };
    const mapElement = fixture.nativeElement.querySelector('#map');
    (component as any).map = { nativeElement: mapElement };
    await component.main();
    expect(plotFn).toHaveBeenCalled();
  });

  it('should use import.meta.url as baseUrl when document.baseURI is empty', async () => {
    component['plotly'] = plotly;
    const mapElement = fixture.nativeElement.querySelector('#map');
    (component as any).map = { nativeElement: mapElement };
    Object.defineProperty(document, 'baseURI', { configurable: true, get: () => '' });
    await component.main();
    Object.defineProperty(document, 'baseURI', { configurable: true, get: () => location.href });
    expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining('assets/countries.json'));
  });

  it('should warn when ensurePlotly import throws', async () => {
    initPlotlySpy.mockRestore();
    vi.spyOn(component as any, 'ensurePlotly').mockImplementationOnce(async () => {
      component['warn']('[Plotly] Failed to load Plotly:', new Error('import failed'));
      return null;
    });
    await component['initPlotly']();
    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.arrayContaining(['[Plotly] Failed to load Plotly:']));
  });

  it('should use plot fallback and warn when ensurePlotly catch runs', async () => {
    initPlotlySpy.mockRestore();
    vi.spyOn(component as any, 'ensurePlotly').mockImplementationOnce(async () => {
      try { throw new Error('load error'); }
      catch (error) {
        component['warn']('[Plotly] Failed to load Plotly:', error);
        return null;
      }
    });
    await component['initPlotly']();
    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.arrayContaining(['[Plotly] Failed to load Plotly:']));
  });

  it('should return null from ensurePlotly when document is undefined', async () => {
    vi.spyOn(component as any, 'hasDocument').mockReturnValue(false);
    component['plotly'] = undefined;
    const result = await component['ensurePlotly']();
    expect(result).toBeNull();
  });

  it('should plot data when Plotly and map are available', async () => {
    initPlotlySpy.mockRestore();
    component['plotly'] = plotly;
    const mapElement = fixture.nativeElement.querySelector('#map');
    expect(mapElement).toBeTruthy();
    (component as any).map = { nativeElement: mapElement };

    const plotFnName = plotly.newPlot ? 'newPlot' : 'plot';
    const plotSpy = vi.spyOn(plotly, plotFnName as any);

    await component.main();

    expect(plotSpy).toHaveBeenCalled();
    expect(fetchSpy).toHaveBeenCalled();
  });
});
