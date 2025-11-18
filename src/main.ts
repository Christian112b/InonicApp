import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient } from '@angular/common/http';
import { addIcons } from 'ionicons';
import { home, storefront, cart, person, reorderFour, cube, gift, restaurant, leaf, star, snow, addCircle, trash, personCircleOutline, logInOutline, personAddOutline, cartOutline, heartOutline, starOutline, locationOutline, cardOutline, notificationsOutline, helpCircleOutline, personOutline, receiptOutline, settingsOutline, logOutOutline, close, mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline, callOutline, shieldCheckmarkOutline, refreshOutline, documentTextOutline, chevronForwardOutline, cash, business, checkmark, remove, checkmarkCircle, bag, location, calculator, sendOutline } from 'ionicons/icons';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

// Add all icons globally to avoid multiple mappings
addIcons({
  home, storefront, cart, person, reorderFour, cube, gift, restaurant, leaf, star, snow, addCircle, trash,
  personCircleOutline, logInOutline, personAddOutline, cartOutline, heartOutline, starOutline, locationOutline,
  cardOutline, notificationsOutline, helpCircleOutline, personOutline, receiptOutline, settingsOutline,
  logOutOutline, close, mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline, callOutline,
  shieldCheckmarkOutline, refreshOutline, documentTextOutline, chevronForwardOutline, cash, business,
  checkmark, remove, checkmarkCircle, bag, location, calculator, sendOutline
});

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideHttpClient(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
  ],
});
