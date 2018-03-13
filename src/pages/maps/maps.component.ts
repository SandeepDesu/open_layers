import { Component, OnInit } from '@angular/core';
import * as ol from 'openlayers';
import { MapService } from '../../services/map.service';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { ColorbarComponent } from '../../app/colorbar/colorbar.component';

@Component({
  selector: 'map-open',
  templateUrl: './maps.component.html',
  styleUrls: ['./maps.component.css']
})

export class MapComponent implements OnInit {

  country = null;
  countryCodes = {};
  npsData = {'geo': [], 'min':0,'max':0};
  displayPopUp = false;
  geoIdLatLonCenter = []; // longitude and Latitude
  usCountiesData = [];
  features: any;
  level = null;
  zoom = null;
  countryParam;
  constructor(public mapService: MapService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.country = params['country'] ? params['country'] : null;
      this.countryParam = this.country;
    });
    setTimeout(() => {
      if (this.country) {
        if (this.country.length === 3) {
          this.country = this.country.substr(1); // TODO do we need a more formal xref here?
          this.level = 'country';
        }
      } else {
        this.country = 'ALL';
        this.countryParam = 'ALL';
        this.level = 'global';
        this.zoom = 2.3;
        this.geoIdLatLonCenter = [0, 0];
      }
      this.renderMap();
    }, 500);
  }

  renderMap() {
    const mapdiv = document.getElementById('map-one');
    mapdiv.setAttribute('style', 'height:' + (window.outerHeight - 70) + 'px');
    window.addEventListener('resize', () => {
      mapdiv.setAttribute('style', 'height:' + (window.outerHeight - 70) + 'px');
    });
    if (this.country && this.country.toLowerCase() === 'us') {
      this.zoom = 4.5;
      this.geoIdLatLonCenter = [-90.68542201, 38];// longitude and Latitude
      this.displayPopUp = true;
      this.drawCountryStates();
    } else if (this.country === 'AR') {
        this.zoom = 4.6;
        this.geoIdLatLonCenter = [-63, -38.61674];
        this.displayPopUp = true;
        this.drawCountryStates();
      } else if (this.country === 'BR') {
      this.zoom = 4.8;
      this.geoIdLatLonCenter = [-52.9500, -11.6500];
      this.displayPopUp = true;
      this.drawCountryStates();
      } else if (this.country === 'ALL') {
      this.displayPopUp = true;
      this.getNpsData();
    }
  }

  async drawCountryStates() {
    await this.getNpsData();
  }

  drawUnitedStatesCounties() {
    this.displayPopUp = true;
    this.mapService.getMissouri_fipsgeom().subscribe((us) => {
      this.usCountiesData = us.periods;
      this.displaySelectedCounties();
    });
  }

  displaySelectedCounties() {
    const container = document.getElementById('popup');
    const content = document.getElementById('popup-content');
    const closer = document.getElementById('popup-closer');
    const overlay = new ol.Overlay(/** @type {olx.OverlayOptions} */({
      element: container,
      autoPan: true,
      autoPanAnimation: {
        duration: 250
      }
    }));
    const vectorLayer = new ol.layer.Vector({
      source: new ol.source.Vector({
        url: 'assets/missouri_fipsgeom.json',
        format: new ol.format.GeoJSON()
      }),
      style: (feature) => {
        if (_.filter(this.usCountiesData, { country_code: feature.getProperties().l2_admincode }).length > 0) {
          return new ol.style.Style({
            fill: new ol.style.Fill({
              color: this.getRandomColor()
            }),
          });
        }
      }
    });
    const layer = new ol.layer.Tile({
      source: new ol.source.OSM()
    });
    const map = new ol.Map({
      layers: [layer, vectorLayer],
      target: 'map-one',
      overlays: [overlay],
      interactions: ol.interaction.defaults({ mouseWheelZoom: false, dragPan: false }),
      view: new ol.View({
        center: ol.proj.transform([-90.68542201, 38], 'EPSG:4326', 'EPSG:3857'),
        zoom: 5
      })
    });
    map.on('singleclick', (evt) => {
      const coordinate = evt.coordinate;
      const source = map.forEachFeatureAtPixel(evt.pixel, (feature) => {
        return { country_code: feature.getProperties().l2_admincode, name: feature.getProperties().l2_admincode };
      });
      if (source && source.country_code && _.filter(this.usCountiesData, { country_code: source.country_code }).length > 0) {
        const sou = _.filter(this.usCountiesData, { country_code: source.country_code });
        let elements = '<div><h5 class="set-margincls">' + source.name + '</h5>';
        elements += '<table class="table table-hover">';
        elements += '<thead><tr><th>Date</th><th>Actual</th><th>YtdActual</th></tr></thead><tbody>';
        elements += '<tr><td>' + sou[0].periodDate + '</td>';
        elements += '<td>' + sou[0].actual + '</td>';
        elements += '<td>' + sou[0].ytdActual + '</td></tr>';
        elements += '</tbody></table></div>';
        content.innerHTML = elements;
        overlay.setPosition(coordinate);
      }
    });
    d3.json('assets/usCountiesArcusCountiesArc.json', (error, us) => {
      this.features = topojson.feature(us, us.objects.counties);
      const geoPoliticalOverlay = new ol.layer.Image({
        source: new ol.source.ImageCanvas({
          canvasFunction: (extent, resolution, pixelRatio, size, projection) => {
            const canvasWidth = size[0];
            const canvasHeight = size[1];
            const canvas = d3.select(document.createElement('canvas'));
            canvas.attr('width', canvasWidth).attr('height', canvasHeight);
            const context = canvas.node().getContext('2d');
            const d3Projection = d3.geoMercator().scale(1).translate([0, 0]);
            let d3Path = d3.geoPath().projection(d3Projection);
            const pixelBounds = d3Path.bounds(this.features);
            const pixelBoundsWidth = pixelBounds[1][0] - pixelBounds[0][0];
            const pixelBoundsHeight = pixelBounds[1][1] - pixelBounds[0][1];
            const geoBounds = d3.geoBounds(this.features);
            const geoBoundsLeftBottom = ol.proj.transform(
              geoBounds[0], 'EPSG:4326', projection);
            const geoBoundsRightTop = ol.proj.transform(
              geoBounds[1], 'EPSG:4326', projection);
            let geoBoundsWidth = geoBoundsRightTop[0] - geoBoundsLeftBottom[0];
            if (geoBoundsWidth < 0) {
              geoBoundsWidth += ol.extent.getWidth(projection.getExtent());
            }
            const geoBoundsHeight = geoBoundsRightTop[1] - geoBoundsLeftBottom[1];

            const widthResolution = geoBoundsWidth / pixelBoundsWidth;
            const heightResolution = geoBoundsHeight / pixelBoundsHeight;
            const r = Math.max(widthResolution, heightResolution);
            const scale = r / (resolution / pixelRatio);

            const center = ol.proj.transform(ol.extent.getCenter(extent),
              projection, 'EPSG:4326');
            d3Projection.scale(scale).center(center)
              .translate([canvasWidth / 2, canvasHeight / 2]);
            d3Path = d3Path.projection(d3Projection).context(context);
            d3Path(this.features);
            context.stroke();
            return canvas._groups[0][0];
          },
          projection: 'EPSG:3857'
        })
      });
      map.addLayer(geoPoliticalOverlay);
    });
  }


  getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  highlightCountry() {
    const vectorLayer = new ol.layer.Vector({
      source: new ol.source.Vector({
        url: 'assets/countryPolygon.json',
        format: new ol.format.GeoJSON()
      }),
      style: (feature) => {
        if (feature.getId('id') === this.countryCodes[this.country.toUpperCase()]) {
          return new ol.style.Style({
            fill: new ol.style.Fill({
              color: 'blue'
            }),
          });
        }
      }
    });
    const layer = new ol.layer.Tile({
      source: new ol.source.OSM()
    });
    const map = new ol.Map({
      layers: [layer, vectorLayer],
      target: 'map-one',
      interactions: ol.interaction.defaults({ mouseWheelZoom: false }),
      view: new ol.View({
        center: [0, 0],
        zoom: 2.3
      })
    });
  }

  getNpsData() {
    this.mapService.getNpsTotalYearData(this.countryParam).subscribe((nps) => {
      this.npsData = nps;
      this.bindDataToMap();
    });
  }
  getGeoLayerFile(level) {
    let fileLocation = '';
    if (level === 'global') {
      fileLocation = 'assets/countryPolygon.json';
    } else if (level === 'country') {
      if (this.country === 'US') {
        fileLocation =  'assets/us-states-geo.json';
      } else if (this.country === 'AR') {
        fileLocation = 'assets/argentina-states-geo.json';
      } else if (this.country === 'BR') {
        fileLocation = 'assets/brazil-states-geo.json';
      }
    }
    return fileLocation;
  }

  bindDataToMap() {
    const popUpContainer = document.getElementById('popup');
    const popUpContent = document.getElementById('popup-content');
    const popUpCloser = document.getElementById('popup-closer');
    const popUpOverlay = new ol.Overlay(/** @type {olx.OverlayOptions} */({
      element: popUpContainer,
      autoPan: true,
      autoPanAnimation: {
        duration: 250
      }
    }));

    popUpCloser.onclick = function () {
      popUpOverlay.setPosition(undefined);
      popUpCloser.blur();
      return false;
    };

    const geoPolitlcalLayer = new ol.layer.Vector({
      source: new ol.source.Vector({
        url: this.getGeoLayerFile(this.level),
        format: new ol.format.GeoJSON()
      }),
      style: (feature) => {
        const geoRow = _.find(this.npsData.geo, {'geoid': feature.getId('id')});
        if (geoRow) {
          return new ol.style.Style({
            fill: new ol.style.Fill({
              color: geoRow.color
            }),
          });
        }
      }
    });

    const backgroundLayer = new ol.layer.Tile({
      source: new ol.source.OSM()
    });
    const map = new ol.Map({
      layers: [backgroundLayer, geoPolitlcalLayer],
      target: 'map-one',
      overlays: [popUpOverlay],
      interactions: ol.interaction.defaults({mouseWheelZoom: false}),
      view: new ol.View({
        center: ol.proj.transform(this.geoIdLatLonCenter, 'EPSG:4326', 'EPSG:3857'),
        zoom: this.zoom
      })
  });
    map.on('singleclick', (evt) => {
      const coordinate = evt.coordinate;
      const source = map.forEachFeatureAtPixel(evt.pixel, (feature) => {
        return { cityId: feature.getId('id'), name: feature.get('name') };
      });
      if (source) {
        const geoData = _.filter(this.npsData.geo, {geoid: source.cityId});
        if (geoData) {
          let elements = '<div><h5 class="set-margincls">' + source.name + '</h5>';
          elements += '<table class="table table-hover">';
          elements += '<thead><tr><th>Date</th><th>YtdActual</th></tr></thead><tbody>';
          elements += '<tr><td>' + geoData[0].periodDate + '</td>';
          // elements += '<td>' + geoData[0].actual + '</td>';
          elements += '<td>' + geoData[0].ytdActual + '</td></tr>';
          elements += '</tbody></table></div>';
          popUpContent.innerHTML = elements;
          popUpOverlay.setPosition(coordinate);
        }
      }
    });
  }
}
