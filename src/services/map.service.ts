import { OnInit, Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions, ResponseContentType } from '@angular/http';
import { CookieService } from 'angular2-cookie/core';
import { environment } from '../environments/environment';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {format} from 'util';
import {credential} from '../assets/credentials';
import {Observable} from 'rxjs/Observable';


@Injectable()
export class MapService implements  OnInit {
  public AUTH_TOKEN: string;
  headers;
  options: RequestOptions;
  private API_base = 'http://localhost:8080/';
  private baseUrl = 'https://dashboard-api-insights.velocity-np.ag/v1/kpi-data/nps-by-geo?geo=%s&product=ALL!ALL!ALL';

  constructor(public http: Http, private cookieService: CookieService) {
       this.API_base = environment.API_base;
  }
  ngOnInit() {
    this._setToken();
  }

  private _getRequestOptions() {
    this._setToken();
    const headers = new Headers({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + this.AUTH_TOKEN });
    return new RequestOptions({ headers: headers });
  }
  private _doPost(url, param): Observable<any>  {
    return this.http.post(url, param, this._getRequestOptions()).map((res: Response) => res.json())
      .catch(this.handleError);
  }
  private _doGet(url): Observable<any>  {
    return this.http.get(url, this._getRequestOptions()).map((res: Response) => res.json())
      .catch(this.handleError);
  }
  private _setToken() {
    if (environment.local) {
      this.AUTH_TOKEN = credential.token;
    } else {
      this.AUTH_TOKEN = this.cookieService.get('datainisghts_map');
    }
  }
  private handleError(error: any) {
    console.error(error);
    return Promise.reject(error);
  }

  getWMSResponse(params): Observable<any>  {
    this._setToken();
    const str_url: string = this.API_base + 'sld/map?' +  params;
    const headers = new Headers({'Authorization': 'Bearer ' + this.AUTH_TOKEN });
    const opts = new RequestOptions({ headers: headers });
    return this.http.get(str_url, opts).map((res: Response) => res)
      .catch(this.handleError);

  }

  getNpsData(kpi, countryCode, geoLevel) {
    this._setToken();
    const str_url = this.API_base + 'data/' + kpi + '/' + countryCode + '/' + geoLevel;
    const headers = new Headers({'Authorization' : 'Bearer ' + this.AUTH_TOKEN });
    const opts = new RequestOptions({headers: headers});
    return this.http.get(str_url, opts)
      .map((res: Response) => {
        return res.json();
      });
  }

  getFeatureInfo(url) {
    const opts = this._getRequestOptions();
    return this.http.get(url, opts).map((res: Response) => res.json())
      .catch(this.handleError);
  }

  getMissouri_fipsgeom() {
       return this.http.get('assets/missouri_fipsgeom.json')
      .map((res: any) => res.json());
  }

  getUnitedStatesPolygons() {
    return this.http.get('assets/us-states-geo.json')
      .map((res: any) => res.json());
  }

    getNpsTotalYearData(countryCode) {
      const url = format(this.baseUrl, countryCode);
      return this.http.get(url, this._getRequestOptions()).map((res: Response) => res.json());
    }
    getCountriesCords() {
        return this.http.get('assets/countryPolygon.json')
            .map((res: any) => res.json());
    }

    getCountryCodes() {
        return this.http.get('assets/country_codes.json')
            .map((res: any) => res.json());
    }
}
