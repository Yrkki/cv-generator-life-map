
import { Component, AfterViewInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import type { PlotData, Layout } from 'plotly.js';

interface Country {
  Country: string;
  Weight: number;
  ISO3: string;
}
type Countries = Country[];

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  @ViewChild('map') public map!: ElementRef<HTMLDivElement>;

  public title = 'Life Map';

  private plotly?: typeof import('plotly.js');

  private get layout() {
    const layout = {
      title: 'Markets',
      geo: {
        scope: 'world',
        resolution: 50,

        projection: {
          type: 'robinson',
          scale: 4.5
        },
        center: {
          lon: 35,
          lat: 52
        },

        bgcolor: 'rgba(0,0,0,0)',

        showocean: true,
        oceancolor: 'rgba(0,255,255,0.2)',
        showland: false,
        landcolor: 'rgba(0,0,0,0.2)',
        showlakes: true,
        lakecolor: 'rgba(0,128,255,0.2)',
        showrivers: true,
        rivercolor: 'rgba(0,0,255,0.2)',
        showcountries: true,
        countrycolor: 'rgba(128,128,128,0.2)',
        showcoastlines: true,
        coastlinecolor: 'rgba(0,0,0,0.2)',
        showframe: true,
        framecolor: 'rgba(0,0,0,0.2)',
      },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      margin: {
        t: 0,
        l: 0,
        r: 0,
        b: 0
      }
    };

    return layout;
  }

  @HostListener('window:resize') public onResize() { this.resize(); }
  @HostListener('window:beforeprint', ['$event']) public onBeforePrint(_event: Event) { this.resize(); }

  public ngAfterViewInit() {
    void this.initPlotly();
  }

  public async main() {
    const plotly = this.plotly;
    if (!plotly) {
      this.warn('[Plotly] main aborted because Plotly is unavailable');
      return;
    }

    if (!this.map?.nativeElement) {
      this.warn('[Plotly] main aborted because map element is unavailable');
      return;
    }

    const baseUrl = typeof document !== 'undefined' && document.baseURI
      ? document.baseURI
      : typeof import.meta?.url !== 'undefined'
        ? import.meta.url
        : undefined;
    const assetUrl = baseUrl
      ? new URL('./assets/countries.json', baseUrl).href
      : './assets/countries.json';

    const response = await fetch(assetUrl);
    const rows: Countries = await response.json();

    const data = this.getData(rows);
    const layout = this.layout as Partial<Layout>;
    await (plotly.newPlot ?? plotly.react)(this.map.nativeElement, data as PlotData[], layout, { showLink: false });
  }

  protected hasDocument(): boolean { return typeof document !== 'undefined'; }

  private async initPlotly() {
    const plotly = await this.ensurePlotly();
    if (!plotly) {
      this.warn('[Plotly] Failed to load Plotly.');
      return;
    }

    await this.main();
  }

  private async ensurePlotly() {
    if (this.plotly) {
      return this.plotly;
    }

    if (!this.hasDocument()) {
      return null;
    }

    try {
      const plotlyModule = await import('plotly.js/dist/plotly-geo.min.js');
      const plotly = plotlyModule.default;
      this.plotly = plotly;
      return plotly;
    } catch (error) {
      this.warn('[Plotly] Failed to load Plotly:', error);
      return null;
    }
  }

  private getData(rows: Countries): Partial<PlotData>[] {
    const unpack = (records: Countries, key: keyof Country) => records.map((row) => row[key]);

    const data: Partial<PlotData>[] = [{
      type: 'choropleth',
      locationmode: 'ISO-3',
      locations: unpack(rows, 'ISO3'),
      z: unpack(rows, 'Weight'),
      text: unpack(rows, 'Country') as string[],
      hovertemplate: '%{z}<extra>%{text}</extra>',
      colorscale: [
        [0, 'rgb(65,105,225)'],
        [1, 'rgb(220,166,224)']
      ],
      colorbar: {
        // title: 'Projects',
        thickness: 20,
        tick0: 0,
        dtick: 1
      },
      marker: {
        line: {
          color: 'rgba(0,0,0,0.5)',
          width: 1
        }
      },
      opacity: 1
    }];

    return data;
  }

  private resize() {
    if (this.plotly && this.map?.nativeElement) {
      this.plotly.Plots.resize(this.map.nativeElement);
    }
  }

  private warn(...data: any[]): void {
    console.warn(data);
  }
}
