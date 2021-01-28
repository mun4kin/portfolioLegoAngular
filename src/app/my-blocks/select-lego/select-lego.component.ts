import {
  Component, Input, OnInit
} from '@angular/core';
import { faCaretLeft, faCaretRight } from '@fortawesome/free-solid-svg-icons';
import { Store } from '@ngrx/store';
import { IStore } from '../../_store';
import { SetCurrentBlock } from '../../_store/actions/block.action';
import { IBlock } from '../../_store/types/block.type';

interface IColor{
  name:string;
  hex:string
}
@Component({
  selector: 'app-select-lego',
  templateUrl: './select-lego.component.html',
  styleUrls: ['./select-lego.component.scss']
})

export class SelectLegoComponent implements OnInit {
  /** Текущий блок*/
  @Input()
  public itemLego: IBlock;
  colors:IColor[] = [
    {
      name: 'red',
      hex: '#e53935'
    },
    {
      name: 'pink',
      hex: '#d81b60'
    },
    {
      name: 'purple',
      hex: '#8e24aa'
    },
    {
      name: 'deep-purple',
      hex: '#5e35b1'
    },
    {
      name: 'indigo',
      hex: '#3949ab'
    },
    {
      name: 'blue',
      hex: '#1e88e5'
    },
    {
      name: 'light-blue',
      hex: '#039be5'
    },
    {
      name: 'cyan',
      hex: '#00acc1'
    },
    {
      name: 'teal',
      hex: '#00897b'
    },
    {
      name: 'green',
      hex: '#43a047'
    },
    {
      name: 'light-green',
      hex: '#7cb342'
    },
    {
      name: 'lime',
      hex: '#c0ca33'
    },
    {
      name: 'yellow',
      hex: '#fdd835'
    },
    {
      name: 'amber',
      hex: '#ffb300'
    },
    {
      name: 'orange',
      hex: '#fb8c00'
    },
    {
      name: 'deep-orange',
      hex: '#f4511e'
    },
    {
      name: 'brown',
      hex: '#6d4c41'
    },
    {
      name: 'grey',
      hex: '#757575'
    },
    {
      name: 'blue-grey',
      hex: '#546e7a'
    },
    {
      name: 'black',
      hex: '#333333'
    },
    {
      name: 'white',
      hex: '#ffffff'
    }
  ];
  faCaretRight=faCaretRight
  faCaretLeft=faCaretLeft
  currentColorId:number;
  currentColor :IColor;
  // ===================================================================================================================
  constructor(private store: Store<IStore>) {}
  // ===================================================================================================================
  ngOnInit(): void {
    this.currentColorId = this.colors.findIndex((item) => {
      return item.hex === this.itemLego?.sBrickColor;
    });
    this.currentColor = this.colors[this.currentColorId];

  }
  // ===================================================================================================================
  switchColor(num: number): void {
    (num > this.colors.length - 1) && (num = 0);
    (num < 0) && (num = this.colors.length - 1);
    this.store.dispatch(new SetCurrentBlock({
      ...this.itemLego,
      sBrickColor: this.colors[num].hex
    }));

  }

}
