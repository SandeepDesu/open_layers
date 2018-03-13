import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-colorbar',
  templateUrl: './colorbar.component.html',
  styleUrls: ['./colorbar.component.css']
})
export class ColorbarComponent implements OnInit {

  @Input() minimumValue;
  @Input() maximumValue;

  percentColors = [
    {pct: 0.0, color: {r: 0xff, g: 0x00, b: 0}},
    {pct: 0.5, color: {r: 0xff, g: 0xff, b: 0xff}},
    {pct: 1.0, color: {r: 0x00, g: 0xff, b: 0}}];

  colorbarArray = [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5,  0.55,  0.6,  0.65,  0.70, 0.75, 0.80, 0.85, 0.90,  0.95, 1];

  constructor() {
  }

  ngOnInit() {

  }

  getColorForPercentage(pct) {
    let i;
    for (i = 1; i < this.percentColors.length - 1; i++) {
      if (pct <= this.percentColors[i].pct) {
        break;
      }
    }
    const lower = this.percentColors[i - 1];
    const upper = this.percentColors[i];
    const range = upper.pct - lower.pct;
    const rangePct = (pct - lower.pct) / range;
    const pctLower = 1 - rangePct;
    const pctUpper = rangePct;
    const color = {
      r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
      g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
      b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
    };
    return 'rgb(' + [color.r, color.g, color.b].join(',') + ')';
    // or output as hex if preferred
  }

  cutDecimals(value, precision){
    if (value) {
      return value.toFixed(precision);
    }
    return 0;
  }

}
