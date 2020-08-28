import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

// Connect Plotly
import { CommonModule } from '@angular/common';
import { PlotlyViaCDNModule } from 'angular-plotly.js';
// PlotlyViaCDNModule.plotlyVersion = 'latest';
// PlotlyViaCDNModule.plotlyBundle = 'geo';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    PlotlyViaCDNModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
