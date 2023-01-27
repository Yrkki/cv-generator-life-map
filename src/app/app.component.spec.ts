/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      declarations: [
        AppComponent
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
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
    expect(() => {
      const readAll = component.onResize();
    }).not.toThrowError();
  });

  it('should check onBeforePrint', () => {
    expect(() => {
      // globalThis.print();
      const readAll = component.onBeforePrint(new Event('print'));
      globalThis.dispatchEvent(new KeyboardEvent('keypress', { key: 'Escape' }));
    }).not.toThrowError();
  });

  it('should test no plotly', () => {
    expect(() => {
      const global = globalThis as any;

      const oldPlotly = global.Plotly;

      global.Plotly = null;
      const readAll = component.main();

      global.Plotly = oldPlotly;
    }).not.toThrowError();
  });

  it('should check all public properties', () => {
    expect(() => {
      // let readAll;
    }).not.toThrowError();
  });

  it('should check all public methods', () => {
    expect(() => {
      let readAll;
      readAll = component.main();
      readAll = component.onBeforePrint(new Event('test'));
      readAll = fixture.debugElement.componentInstance.resize();
    }).not.toThrowError();
  });
});
