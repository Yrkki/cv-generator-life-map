 
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AppComponent } from './app.component';
// import template from './app.component.html?raw';
// import styles from './app.component.scss?raw';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  let plotly: any;
  let fetchSpy: any;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    plotly = (globalThis as any).Plotly;
    if (!plotly) {
      throw new Error('Plotly did not load for tests');
    }
    fetchSpy = vi.spyOn(globalThis as any, 'fetch');
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    // TestBed.overrideComponent(AppComponent, {
    //   set: {
    //     template,
    //     styles: [styles],
    //     templateUrl: undefined,
    //     styleUrls: undefined
    //   }
    // });

    await TestBed.configureTestingModule({
      imports: [AppComponent]
    });

    // await TestBed.resolveComponentResources();
    await TestBed.compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  // afterEach(async () => {
  //   fetchSpy.mockRestore();
  //   consoleWarnSpy.mockRestore();
  // });

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
    // expect(fetchSpy).toHaveBeenCalled();
    // expect(fetchSpy.mock.calls[0][0]).toContain('assets/countries.json');
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
    const mainSpy = vi.spyOn(component as any, 'main').mockResolvedValue(undefined);
    await component['initPlotly']();
    expect(mainSpy).toHaveBeenCalled();
  });

  it('should warn when initPlotly fails to load Plotly', async () => {
    const ensureSpy = vi.spyOn(component as any, 'ensurePlotly').mockResolvedValue(null);
    await component['initPlotly']();
    expect(consoleWarnSpy).toHaveBeenCalledWith(['[Plotly] Failed to load Plotly.']);
  });

  it('should plot data when Plotly and map are available', async () => {
    component['plotly'] = plotly;
    const mapElement = fixture.nativeElement.querySelector('#map');
    expect(mapElement).toBeTruthy();
    (component as any).map = { nativeElement: mapElement };

    const plotFnName = plotly.newPlot ? 'newPlot' : 'plot';
    const plotSpy = vi.spyOn(plotly, plotFnName as any);
    fetchSpy.mockResolvedValue(new Response(JSON.stringify([{ Country: 'Test', Weight: 1, ISO3: 'TST' }]), {
      headers: { 'Content-Type': 'application/json' }
    }));

    await component.main();

    expect(plotSpy).toHaveBeenCalled();
    expect(fetchSpy).toHaveBeenCalled();
  });

  it('should expose a consistent layout object', () => {
    const layout = component['layout'];
    expect(layout.title).toBe('Markets');
    expect(layout.geo.scope).toBe('world');
  });

  it('reports which Plotly implementation is used', () => {
    const src = (globalThis as any).__PLOTLY_SOURCE;
    expect(src).toBe('npm');
  });

  it('logs Plotly info to the test output', () => {
    const src = (globalThis as any).__PLOTLY_SOURCE;
    const ver = (globalThis as any).__PLOTLY_VERSION;
    console.info('[tests] Plotly page source:', src, 'version:', ver);
    expect(src).toBeDefined();
    expect(ver).toBeDefined();
  });
});
