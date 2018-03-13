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

}
