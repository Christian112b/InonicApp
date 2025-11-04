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
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');

    if (!token || !userData) {
      // User not logged in, redirect to account tab
      const accountTab = document.querySelector('ion-tab-button[tab="cuenta"]') as HTMLElement;
      if (accountTab) {
        accountTab.click();
      }
      return;
    }

    // User is logged in, proceed to cart
    const cartTab = document.querySelector('ion-tab-button[tab="carrito"]') as HTMLElement;
    if (cartTab) {
      cartTab.click();
    }

    // Emit event to refresh cart data when opening
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
