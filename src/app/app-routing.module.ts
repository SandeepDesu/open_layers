import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MapComponent } from '../pages/maps/maps.component';
import { MapGeoServeComponent } from './map-geo-serve/map-geo-serve.component';
import { HomeComponent } from './home/home.component';
import { DataTableComponent } from './data-table/data-table.component';

const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'map',
    component: MapComponent,
  },
  {
    path: 'heatmap',
    component: MapGeoServeComponent
  },
  {
    path: 'table',
    component: DataTableComponent,
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      appRoutes,
    )
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
