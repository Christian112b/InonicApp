import { Component, EnvironmentInjector, inject } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { home, storefront, cart, person, reorderFour } from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, CommonModule],
})
export class TabsPage {
  public environmentInjector = inject(EnvironmentInjector);

  constructor() {
    addIcons({ home, storefront, cart, person, reorderFour });
  }

  openCartFromTab() {
    // Emit event to open cart modal in the active tab
    const cartEvent = new CustomEvent('openCartModal');
    window.dispatchEvent(cartEvent);

    // Also refresh cart data when opening from tab bar
    const refreshEvent = new CustomEvent('refreshCartData');
    window.dispatchEvent(refreshEvent);
  }

  getCartItemCount(): number {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      const cartItems = JSON.parse(savedCart);
      return cartItems.reduce((count: number, item: any) => count + item.cantidad, 0);
    }
    return 0;
  }
}
