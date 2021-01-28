import { Component, OnInit } from '@angular/core';
import { SwiperConfigInterface } from 'ngx-swiper-wrapper';
import { Store } from '@ngrx/store';
import { IStore } from '../_store';
import { SetCurrentBlock } from '../_store/actions/block.action';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IBlock } from '../_store/types/block.type';

@Component({
  selector: 'app-my-blocks',
  templateUrl: './my-blocks.component.html',
  styleUrls: ['./my-blocks.component.scss']
})
export class MyBlocksComponent implements OnInit {
  /** Информация по блокам*/
  public blocks$:Observable<IBlock[]>
  contentSwiperConfig: SwiperConfigInterface = {
    direction: 'horizontal',
    slidesPerView: 'auto',
    mousewheel: true,
    pagination: {
      el: '.swiper-pagination',
      clickable: true
    }

  };
  // ===================================================================================================================
  constructor( private store: Store<IStore>) {
    this.blocks$ = store.select('blocks').pipe(map((item) => item.blocks));
  }
  // ===================================================================================================================
  ngOnInit(): void { }

  // ===================================================================================================================
  changeActiveBlock(name: IBlock): void {
    this.store.dispatch(new SetCurrentBlock(name));

  }
}
