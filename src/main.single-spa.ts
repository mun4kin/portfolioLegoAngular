import { enableProdMode, NgZone } from '@angular/core';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Router } from '@angular/router';
import { AppModule, DEFAULT_SWIPER_CONFIG } from './app/app.module';
import { environment } from './environments/environment';
import { singleSpaAngular } from 'single-spa-angular';
import { APP_BASE_HREF } from '@angular/common';
import { SWIPER_CONFIG } from 'ngx-swiper-wrapper';
// import { singleSpaPropsSubject } from './single-spa/single-spa-props';

if (environment.production) {
  enableProdMode();
}

function findTeg(tegName = ''):Promise<boolean> {
  return new Promise((resolve) => {
    let r;
    r = document.getElementById(`${tegName}`);
    r && resolve(true);
    const i = setInterval(() => {
      r = document.getElementById(`${tegName}`);

      if (r) {
        resolve(true);
        clearInterval(i);
      }
    }, 500);

  });
}
const lifecycles = singleSpaAngular({
  bootstrapFunction: () => {
    // singleSpaPropsSubject.next(singleSpaProps);
    return platformBrowserDynamic([
      {
        provide: APP_BASE_HREF,
        useValue: '/'
      },
      {
        provide: SWIPER_CONFIG,
        useValue: DEFAULT_SWIPER_CONFIG
      }
    ]).bootstrapModule(AppModule);
  },
  template: '<app-root />',
  Router,
  NgZone,
  domElementGetter: () => document.getElementById('lego')
});

export const bootstrap = [
  async() => {
    findTeg('lego');
    return true;
  },
  lifecycles.bootstrap
];
export const mount = lifecycles.mount;
export const unmount = lifecycles.unmount;
