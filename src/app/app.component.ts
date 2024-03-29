/* eslint-disable max-lines-per-function */
import { Component, AfterViewInit, HostListener, ViewChild, ElementRef } from '@angular/core';

/** The global this object */
const global = globalThis as any;

/** The global Plotly object */
const plotly = global.Plotly;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  @ViewChild('map') public map!: ElementRef<HTMLDivElement>;

  public title = 'Life Map';

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
    this.main();
  }

  public main() {
    plotly.d3.csv('../assets/countries.csv',
      (_err: any, rows: any) => {
        const data = this.getData(rows);
        const layout = this.layout;
        plotly.plot(this.map.nativeElement, data, layout, { showLink: false });
      });
  }

  private getData(rows: any) {
    const unpack = (_: any[], key: string) => _.map((row) => row[key]);

    const data = [{
      type: 'choropleth',
      locationmode: 'country names',
      locations: unpack(rows, 'Country'),
      z: unpack(rows, 'Weight'),
      // text: unpack(rows, 'Country'),
      autocolorscale: false,
      colorscale: [
        [0, 'rgb(65,105,225)'],
        [1, 'rgb(220,166,224)']
      ],
      colorbar: {
        // title: 'Projects',
        thickness: 20,
        tick0: 0,
        dtick: 1,
        autotick: false
      },
      marker: {
        line: {
          color: 'rgba(0,0,0,0.5)',
          width: 1
        }
      },
      opacity: 1,
      // margin: {
      //   t: 0, // top margin
      //   l: 0, // left margin
      //   r: 0, // right margin
      //   b: 0 // bottom margin
      // }
    }];

    return data;
  }

  private resize() {
    plotly.Plots.resize(this.map.nativeElement);
  }
}
