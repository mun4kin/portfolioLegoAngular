import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { MainGameComponent } from './main-game/main-game.component';
import { MyBlocksComponent } from './my-blocks/my-blocks.component';
import { SelectLegoComponent } from './my-blocks/select-lego/select-lego.component';
import { SwiperModule } from 'ngx-swiper-wrapper';

import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { EffectsModule } from '@ngrx/effects';
import { mainReducer } from './_store';

import { environment } from '../environments/environment';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { APP_BASE_HREF } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';


@NgModule({
  declarations: [
    AppComponent,
    MainGameComponent,
    MyBlocksComponent,
    SelectLegoComponent
  ],
  imports: [
    BrowserModule,
    FontAwesomeModule,
    SwiperModule,
    AppRoutingModule,
    StoreModule.forRoot(mainReducer),
    EffectsModule.forRoot(),
    environment.production ? [] : StoreDevtoolsModule.instrument( ),
  ],
  providers: [
    {
      provide: APP_BASE_HREF,
      useValue: '/'
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
/*
 * Import { InjectionToken, ModuleWithProviders, Injector } from '@angular/core';
 * import { Store, ReducerManager } from '@ngrx/store';
 * import { NgrxSelect } from './select';
 * export declare const STORE_TOKEN: InjectionToken<any>;
 * export declare const FEATURE_STORE_TOKEN: InjectionToken<any>;
 */
