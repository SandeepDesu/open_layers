import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapGeoServeComponent } from './map-geo-serve.component';

describe('MapGeoServeComponent', () => {
  let component: MapGeoServeComponent;
  let fixture: ComponentFixture<MapGeoServeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapGeoServeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapGeoServeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
