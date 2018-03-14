import { Component, OnInit, ApplicationRef, ComponentFactoryResolver, ComponentRef, Injector } from '@angular/core';
import * as ol from 'openlayers';
import { environment } from 'environments/environment';
import { MapService } from '../../services/map.service';
import { PopUpComponent } from '../pop-up/pop-up.component';
import * as _ from 'lodash';
import { multiBarData, exampleTableTwo } from '../exampledata';
@Component({
  selector: 'app-map-geo-serve',
  templateUrl: './map-geo-serve.component.html',
  styleUrls: ['./map-geo-serve.component.css']
})
export class MapGeoServeComponent implements OnInit {
  kpi: string = 'NPS';
  geo: string = 'ALL';
  subGeo: string = 'COUNTRY';
  SUBGEOARR = [
    { "value": "COUNTRY", "name": "Country" },
    { "value": "STATE", "name": "State" },
    { "value": "COUNTY", "name": "County" }
  ];

  geoIdLatLonCenter = [-96.5, 38]; // longitude and Latitude center over US
  zoom = 4.5;
  format = 'image/png';
  kpiData = null;
  compRef: ComponentRef<PopUpComponent>;
  private displaymap = null;
  private geolayer = null;
  private geopoliticalSource = null;
  private popUpOverlay = null;
  private dataservice = null;
  private featureinfoservice = null;

  VECTOR_LAYER = new ol.layer.Vector({
    source: new ol.source.Vector({
      url: 'assets/countryPolygon.json',
      format: new ol.format.GeoJSON()
    })
  });

  TONER_LAYER = new ol.layer.Tile({
    source: new ol.source.Stamen({
      // layer: 'toner-lite'
      layer: 'toner-hybrid'
    }),
    opacity: 1.0,
    contrast: 1.0
  });
  TERRAIN_LAYER = new ol.layer.Tile({
    source: new ol.source.Stamen({
      // layer: 'terrain-labels'
      // layer: 'terrain-background'
      // layer: 'terrain-lines'
      layer: 'toner-lite'
      // layer:'watercolor'
    }),
    opacity: 1.0,
    contrast: 1.0
  });

  constructor(public mapService: MapService, private injector: Injector, private resolver: ComponentFactoryResolver, private appRef: ApplicationRef) { }

  ngOnInit() {
    this.renderMap();
  }

  ngOnDestroy() {
    if (this.dataservice) {
      this.dataservice.unsubscribe();
      this.featureinfoservice.unsubscribe();
    }
  }


  public setGeoSource() {
    const params = {
      url: environment.API_base + 'sld/wms',
      params: {
        kpi: this.kpi,
        geo: this.geo,
        subgeo: this.subGeo
      }
    };
    this.dataservice = this.mapService.getNpsData(this.kpi, this.geo, this.subGeo).subscribe((data) => {
      this.kpiData = data
    });
    this.geopoliticalSource = new ol.source.ImageWMS(params);
  }

  onSubgeoChange() {
    this.setGeoSource();
    this.geolayer.setSource(this.geopoliticalSource)
  }

  setDataLayer() {
    this.setGeoSource();
    const geoDataLayer = new ol.layer.Image({
      source: this.geopoliticalSource,
      opacity: 1.0,
      brightness: 0.9
    });
    this.geolayer = geoDataLayer;
  }

  renderMap() {
    this.setDataLayer();
    this.popUpOverlay = new ol.Overlay({
      element: document.getElementById('popup'),
      autoPan: true,
      autoPanAnimation: {
        duration: 250
      }
    });
    const projection = new ol.proj.Projection({
      code: 'CRS:84',
      units: 'degrees',
      axisOrientation: 'enu',
      global: true
    });
    const view = new ol.View({
      center: this.geoIdLatLonCenter,
      zoom: this.zoom,
      projection: projection
    });
    this.displaymap = new ol.Map({
      layers: [this.VECTOR_LAYER, this.TERRAIN_LAYER, this.geolayer, this.TONER_LAYER],
      // layers: [geoDataLayer],
      renderer: 'canvas',
      target: 'heatMap',
      overlays: [this.popUpOverlay],
      view: view
    });
    this.displaymap.on('singleclick', (evt) => {
      this.ShowFeaturInfo(view, evt);
    });
  }

  ShowFeaturInfo(view, evt) {
    const popUpContent = document.getElementById('popup-content');
    const popUpCloser = document.getElementById('popup-closer');
    let self = this;
    popUpCloser.onclick = function () {
      self.popUpOverlay.setPosition(undefined);
      this.blur();
      return false;
    };
    const viewResolution = view.getResolution();
    const viewProjection = view.getProjection();
    const url = this.geopoliticalSource.getGetFeatureInfoUrl(
      evt.coordinate, viewResolution, viewProjection,
      { 'geo': this.geo, 'subgeo': this.subGeo }
    );
    if (this.compRef) this.compRef.destroy();
    const coordinate = evt.coordinate;
    const source = this.displaymap.forEachFeatureAtPixel(evt.pixel, (feature) => {
      return { name: feature.get('name') };
    });
    let sampleArr = [];
    let tableInfoOne = { data: [], headers: [{ 'title': 'YEAR', 'fieldName': 'year' }, { 'title': 'COUNT', 'fieldName': 'count' }, { 'title': 'VALUE', 'fieldName': 'value' }] };
    multiBarData[0].allvalues.forEach((data, k) => {
      tableInfoOne.data.push(data);
      if (sampleArr.length > 0) {
        const index = _.findIndex(sampleArr, { label: data.year });
        if (index === -1) {
          let obj = {};
          obj['label'] = data.year;
          obj[0] = data.value
          sampleArr.push(obj);
        } else {
          let obj = sampleArr[index];
          obj[Object.keys(obj).length - 1] = data.value;
          sampleArr[index] = obj;
        }
      } else {
        let obj = {};
        obj['label'] = data.year;
        obj[0] = data.value
        sampleArr.push(obj);
      }
    })
    const compFactory = this.resolver.resolveComponentFactory(PopUpComponent);
    this.compRef = compFactory.create(this.injector);
    this.compRef.instance.barData = sampleArr;
    this.compRef.instance.tableOne = tableInfoOne;
    this.compRef.instance.tableTwo = exampleTableTwo;
    popUpContent.appendChild(this.compRef.location.nativeElement);
    this.popUpOverlay.setPosition(coordinate);
    this.appRef.attachView(this.compRef.hostView);
    this.compRef.onDestroy(() => {
      this.appRef.detachView(this.compRef.hostView);
    });
  }

}
