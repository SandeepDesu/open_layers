import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.css']
})
export class DataTableComponent implements OnInit {

  @Input() source;
  headers: any[];
  data: any[];

  constructor() { }

  ngOnInit() {
    if (this.source) {
      this.headers = this.source.headers;
      this.data = this.source.data;
    }
  }

  getValueByFieldName(data, fieldName) {
    var index = fieldName.indexOf('.');
    if (index === -1) {
      return data[fieldName];
    } else {
      return this.getValueFromObject(data, fieldName.split('.'));
    }
  }

  getValueFromObject(obj, keys) {
    if (keys.length === 1) {
      return obj[keys];
    } else if (keys[0].indexOf('[') > -1) {
      return this.getValueFromArrayObject(obj[keys[0].split('[')[0]], keys[0].split('[')[1], keys.splice(1))
    } else {
      return this.getValueFromObject(obj[keys[0]], keys.splice(1));
    }
  }

  getValueFromArrayObject(obj, key, keys) {
    if (keys.length === 1) {
      return obj[key.split(']')[0]][keys[0]];
    } else {
      return this.getValueFromObject(obj[key.split(']')[0]], keys);
    }
  }
}
