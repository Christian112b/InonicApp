import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonSpinner, IonButton, IonRouterLink, ViewWillEnter } from '@ionic/angular/standalone';
import { CheckoutModalComponent } from '../modals/checkout-modal/checkout-modal.component';
import { Router, NavigationEnd } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ToastController } from '@ionic/angular';
import { CartService } from '../services/cart.service';
import { filter } from 'rxjs/operators';

// Environment configuration
// const API_BASE_URL = 'http://localhost:5000'; // Localhost URL for development
const API_BASE_URL = 'https://backend-app-x7k2.zeabur.app'; // Production URL

interface CartItem {
  id: number;
  name: string;
  image?: string;
  imagen_base64?: string;
  price: number;
  quantity: number;
}

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonButton, IonSpinner, CommonModule, CheckoutModalComponent],
})
export class Tab3Page implements OnInit, OnDestroy, ViewWillEnter {
  private routerSubscription: any;
  public cartItems: CartItem[] = [];
  public cartTotal: number = 0;
  public cartItemCount: number = 0;
  public isLoadingCart: boolean = false;
  public isLoggedIn: boolean = false;
  public hasError: boolean = false;

  constructor(private http: HttpClient, private toastController: ToastController, private router: Router, private cartService: CartService) {
  }

  ngOnInit() {
    this.checkAuthStatus();

    // Listen for navigation events to save cart when leaving
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        // Just save to local storage when navigating away from cart tab
        if (this.isLoggedIn && this.cartItems.length > 0) {
          this.saveCartToStorage();
        }
      });

    // Listen for cart refresh events from tab bar
    window.addEventListener('refreshCartData', () => {
      if (this.isLoggedIn) {
        // Just reload from local storage
        this.loadCartFromStorage();
      }
    });

    // Listen for cart updates from other tabs
    window.addEventListener('cartUpdated', () => {
      if (this.isLoggedIn) {
        // Just reload from local storage
        this.loadCartFromStorage();
      }
    });

    // Listen for auth changes
    window.addEventListener('authChanged', () => {
      this.checkAuthStatus();
      if (this.isLoggedIn) {
        this.updateCartUI();
      }
    });
  }

  ionViewWillEnter() {
    // Load cart from backend every time the tab is entered
    if (this.isLoggedIn) {
      this.updateCartUI();
    }
  }

  getProductIcon(productName: string): string {
    const name = productName.toLowerCase();
    if (name.includes('tornillo')) return 'cube';
    if (name.includes('princesa') || name.includes('surtida')) return 'gift';
    if (name.includes('duquesa')) return 'restaurant';
    if (name.includes('esponja') || name.includes('natural')) return 'leaf';
    if (name.includes('figura')) return 'star';
    if (name.includes('menta') || name.includes('blanca')) return 'snow';
    return 'cube';
  }


  removeFromCart(productId: number) {
    this.cartItems = this.cartItems.filter(item => item.id !== productId);
    this.updateCartTotals();
    this.saveCartToStorage();
    // Cart will be saved when proceeding to checkout or changing tabs
  }

  updateCartItemQuantity(productId: number, quantity: number) {
    const item = this.cartItems.find(item => item.id === productId);
    if (item) {
      item.quantity = Math.max(0, quantity);
      if (item.quantity === 0) {
        this.removeFromCart(productId);
      } else {
        this.updateCartTotals();
        this.saveCartToStorage();
        // Cart will be saved when proceeding to checkout or changing tabs
      }
    }
  }

  updateCartTotals() {
    this.cartTotal = this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    this.cartItemCount = this.cartItems.reduce((count, item) => count + item.quantity, 0);
  }

  saveCartToStorage() {
    // Save complete cart data to localStorage
    try {
      localStorage.setItem('costanzoCart', JSON.stringify(this.cartItems));
    } catch (error) {
      console.warn('Could not save cart to localStorage');
    }
  }

  loadCartFromStorage() {
    // Load complete cart data from localStorage
    try {
      const savedCart = localStorage.getItem('costanzoCart');
      if (savedCart) {
        const cartData = JSON.parse(savedCart);
        // Load cart items with complete data - no dummy data creation
        this.cartItems = cartData.filter((item: any) =>
          item.id && item.name && item.quantity && typeof item.quantity === 'number'
        );
        this.updateCartTotals();
      }
    } catch (error) {
      console.warn('Could not load cart from localStorage');
      this.cartItems = [];
    }
  }

  clearCart() {
    this.cartItems = [];
    this.updateCartTotals();
    this.saveCartToStorage();
    // Cart will be saved when proceeding to checkout or changing tabs
  }

  persistCartToBackend() {
    if (!this.isLoggedIn || this.cartItems.length === 0) {
      return Promise.resolve({ ok: true }); // No need to save if not logged in or cart is empty
    }

    // Convert cart items to the format expected by the backend
    const cartData = this.cartItems.map(item => ({
      id: item.id,
      quantity: item.quantity,
      price: item.price
    }));

    return this.cartService.saveCart(cartData).toPromise()
      .then((data: any) => {
        if (data.ok) {
          console.log('✅ Cart saved successfully');
        } else {
          console.error('❌ Error saving cart to backend:', data);
        }
        return data;
      })
      .catch(err => {
        console.error('❌ Error saving cart to backend:', err);
        // Don't throw error - we don't want to break the user experience
        return { ok: false, error: err };
      });
  }

  updateCartUI() {
    this.isLoadingCart = true;

    // Load cart from backend using JWT authentication
    const token = localStorage.getItem('jwt_token');
    let headers = {};
    if (token) {
      headers = { 'Authorization': `Bearer ${token}` };
    }
    this.http.get(`${API_BASE_URL}/getItemsCart`, { headers, withCredentials: true }).subscribe({
      next: (data: any) => {
        if (data.ok) {
          const items = (data.items || []).map((item: any) => {
            // Check if image already has data URL prefix
            let imageUrl = null;
            if (item.image) {
              if (item.image.startsWith('data:image')) {
                imageUrl = item.image; // Already has prefix
              } else {
                imageUrl = `data:image/jpeg;base64,${item.image}`; // Add prefix
              }
            }

            return {
              id: item.id,
              name: item.name,
              image: imageUrl,
              price: parseFloat(item.price) || 0,
              quantity: item.quantity
            };
          });


          this.cartItems = items;
          this.updateCartTotals();
          this.saveCartToStorage();
        } else {
          console.warn('⚠️ Respuesta no OK:', data);
          // Clear cart if no items
          this.cartItems = [];
          this.updateCartTotals();
        }
        this.isLoadingCart = false;
      },
      error: (error) => {
        console.error('❌ Error loading cart from backend:', error);
        this.hasError = true;
        this.isLoadingCart = false;
        // Clear cart on error
        this.cartItems = [];
        this.updateCartTotals();
      }
    });
  }

  showCheckoutModal = false;

  proceedToCheckout() {
    if (this.cartItems.length === 0) {
      alert('Tu carrito está vacío');
      return;
    }

    // Just save to local storage before proceeding to checkout
    this.saveCartToStorage();

    // Open checkout modal
    this.showCheckoutModal = true;
  }

  onCheckoutComplete(result: any) {
    this.showCheckoutModal = false;
    if (result.success) {
      // Clear cart after successful payment
      this.cartItems = [];
      this.updateCartTotals();
      this.saveCartToStorage();

      // Show success message
      this.showToast('¡Compra realizada exitosamente!', 'success');

      // Navigate to orders page with refresh flag to show the new order
      this.router.navigate(['/orders'], {
        state: { refreshOrders: true }
      });
    }
  }

  closeCheckoutModal() {
    this.showCheckoutModal = false;
  }

  ngOnDestroy() {
    // Unsubscribe from router events
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }

    // Final cart save to local storage when component is destroyed
    if (this.isLoggedIn && this.cartItems.length > 0) {
      this.saveCartToStorage();
    }
  }

  private checkAuthStatus() {
    const token = localStorage.getItem('jwt_token');
    const userData = localStorage.getItem('userData');
    this.isLoggedIn = !!(token && userData);
  }



  private async showDevelopmentToast(message: string) {
    const toast = await this.toastController.create({
      message: `${message} - Esta funcionalidad está en desarrollo`,
      duration: 2000,
      position: 'bottom',
      cssClass: 'toast-warning'
    });
    await toast.present();
  }

  goToLogin() {
    // Navigate to the account tab (tab4) without page reload
    this.router.navigate(['/tabs/cuenta']);
  }

  goToProducts() {
    // Navigate to the products tab (tab2)
    this.router.navigate(['/tabs/productos']);
  }

  retryLoadCart() {
    if (this.isLoggedIn) {
      this.updateCartUI();
    }
  }


  private async showToast(message: string, type: 'success' | 'error' | 'warning' = 'success') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'top',
      cssClass: `toast-${type}`
    });
    await toast.present();
  }
}
