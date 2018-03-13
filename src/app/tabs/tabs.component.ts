import { Component, EventEmitter, Output } from '@angular/core';
export interface Tab {
  tabTitle: string,
  selected?: boolean
}
@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.css']
})
export class TabsComponent {

  tabs: Tab[] = [];
  selectedTabName = null;
  @Output() selected = new EventEmitter();

  addTab(tab: Tab) {
    if (!this.tabs.length) {
      tab.selected = true;
      this.selectedTabName = tab.tabTitle;
    }
    this.tabs.push(tab);
  }

  selectTab(tab: Tab) {
    this.tabs.map((tab) => {
      tab.selected = false;
    })
    tab.selected = true;
    this.selectedTabName = tab.tabTitle;
    this.selected.emit({ selectedTab: tab });
  }

}
