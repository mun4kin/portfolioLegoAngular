import { enableProdMode, NgZone } from '@angular/core';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Router } from '@angular/router';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { getSingleSpaExtraProviders, singleSpaAngular } from 'single-spa-angular';
// import { singleSpaPropsSubject } from './single-spa/single-spa-props';

const tegName = 'mainContent';
environment.production && enableProdMode();

const findTeg = (tegName = ''):Promise<boolean> => new Promise((resolve) => {
  document.getElementById(`${tegName}`) && resolve(true);
  const i = setInterval(() => {
    if (document.getElementById(`${tegName}`)) {
      resolve(true);
      clearInterval(i);
    }
  }, 50);
});
const lifecycles = singleSpaAngular({
  bootstrapFunction: () => platformBrowserDynamic(getSingleSpaExtraProviders()).bootstrapModule(AppModule),
  template: '<app-root />',
  Router,
  NgZone,
  domElementGetter: () => document.getElementById(tegName)
});

export const bootstrap = [
  async() => {
    await findTeg(tegName);
    return true;
  },
  lifecycles.bootstrap
];
export const mount = lifecycles.mount;
export const unmount = lifecycles.unmount;
