import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { Router } from '@angular/router';
import { CookieService } from 'angular2-cookie/services/cookies.service';
import { AppComponent } from './app.component';
import { MapComponent } from '../pages/maps/maps.component';
import { FormsModule } from '@angular/forms';
import { MapService } from '../services/map.service';
import { ColorbarComponent } from './colorbar/colorbar.component';
import { MapGeoServeComponent } from './map-geo-serve/map-geo-serve.component';
import {AppRoutingModule} from './app-routing.module';
import { HomeComponent } from './home/home.component';
import { DataTableComponent } from './data-table/data-table.component';
import { PopUpComponent } from './pop-up/pop-up.component';
import { BarChartComponent } from './bar-chart/bar-chart.component';
import { TabComponent } from './tab/tab.component';
import { TabsComponent } from './tabs/tabs.component';


@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    ColorbarComponent,
    MapGeoServeComponent,
    HomeComponent,
    DataTableComponent,
    PopUpComponent,
    BarChartComponent,
    TabComponent,
    TabsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpModule
  ],
  entryComponents: [
    PopUpComponent
  ],
  exports: [
    MapGeoServeComponent
  ],
  providers: [MapService, CookieService],
  bootstrap: [AppComponent]
})
export class AppModule {
  // Diagnostic only: inspect router configuration
  constructor(router: Router) {
  }
}
