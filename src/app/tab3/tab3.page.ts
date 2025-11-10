import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonSpinner, IonButton, IonRouterLink } from '@ionic/angular/standalone';
import { CheckoutModalComponent } from '../modals/checkout-modal/checkout-modal.component';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { cube, gift, restaurant, leaf, star, snow, cart, addCircle, trash } from 'ionicons/icons';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ToastController } from '@ionic/angular';

// Environment configuration
// const API_BASE_URL = 'http://localhost:5000'; // Localhost URL for development
const API_BASE_URL = 'https://backend-app-x7k2.zeabur.app/'; // Production URL

interface CartItem {
  id: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonButton, IonSpinner, IonRouterLink, CommonModule, CheckoutModalComponent],
})
export class Tab3Page implements OnInit, OnDestroy {
  public cartItems: CartItem[] = [];
  public cartTotal: number = 0;
  public cartItemCount: number = 0;
  public isLoadingCart: boolean = false;
  public isLoggedIn: boolean = false;
  public hasError: boolean = false;

  constructor(private http: HttpClient, private toastController: ToastController, private router: Router) {
    addIcons({
      cube, gift, restaurant, leaf, star, snow, cart, addCircle, trash,
      'cart-outline': cart,
      'log-in-outline': 'log-in',
      'storefront-outline': 'storefront',
      'image-outline': 'image',
      'remove': 'remove',
      'add': 'add',
      'card-outline': 'card'
    });
  }

  ngOnInit() {
    this.checkAuthStatus();

    // Load cart from backend if logged in (no localStorage fallback)
    if (this.isLoggedIn) {
      this.updateCartUI();
    }

    // Listen for cart refresh events from tab bar
    window.addEventListener('refreshCartData', () => {
      if (this.isLoggedIn) {
        this.updateCartUI();
      }
    });

    // Listen for cart updates from other tabs
    window.addEventListener('cartUpdated', () => {
      if (this.isLoggedIn) {
        this.updateCartUI();
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
    // Save to backend when navigating away or proceeding to checkout
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
        // Save to backend when navigating away or proceeding to checkout
      }
    }
  }

  updateCartTotals() {
    this.cartTotal = this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    this.cartItemCount = this.cartItems.reduce((count, item) => count + item.quantity, 0);
  }

  saveCartToStorage() {
    // Since we have backend sync, we don't need to store full cart data locally
    // Just store minimal cart state for offline functionality
    try {
      const minimalCart = this.cartItems.map(item => ({
        id: item.id,
        quantity: item.quantity
      }));
      localStorage.setItem('costanzoCart', JSON.stringify(minimalCart));
    } catch (error) {
      console.warn('Could not save cart to localStorage, continuing with backend sync only');
      // Don't throw error - backend sync is the primary storage
    }
  }

  loadCartFromStorage() {
    // Since we prioritize backend data, localStorage is just a fallback
    try {
      const savedCart = localStorage.getItem('costanzoCart');
      if (savedCart) {
        const minimalCart = JSON.parse(savedCart);
        // Convert minimal cart back to full format (without images/prices)
        this.cartItems = minimalCart.map((item: any) => ({
          id: item.id,
          name: `Producto ${item.id}`, // Placeholder name
          image: null, // Will be updated from backend
          price: 0, // Will be updated from backend
          quantity: item.quantity
        }));
        this.updateCartTotals();
      }
    } catch (error) {
      console.warn('Could not load cart from localStorage, will use backend data');
      this.cartItems = [];
    }
  }

  clearCart() {
    this.cartItems = [];
    this.updateCartTotals();
    this.saveCartToStorage();
    // Save to backend when navigating away or proceeding to checkout
  }

  persistCartToBackend() {
    // Simular guardado en backend
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({ ok: true });
      }, 500);
    });

    // Código comentado para cuando tengas el backend listo:
    /*
    return this.http.post(`${API_BASE_URL}/saveCart`, { items: this.cartItems }, { withCredentials: true }).toPromise()
      .then((data: any) => {
        if (!data.ok) {
          console.error('Error saving cart to backend');
        }
        return data;
      })
      .catch(err => {
        console.error('Error saving cart:', err);
        throw err;
      });
    */
  }

  updateCartUI() {
    this.isLoadingCart = true;

    // Load cart from backend (now uses JWT authentication)
    const token = localStorage.getItem('jwt_token');
    let headers = {};
    if (token) {
      headers = { 'Authorization': `Bearer ${token}` };
    }
    console.log('Loading cart - token:', token);

    this.http.get(`${API_BASE_URL}/getItemsCart`, { headers, withCredentials: true }).subscribe({
      next: (data: any) => {
        console.log('📦 Respuesta del carrito:', data);
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


          console.log('✅ Items procesados:', items.length, 'items');
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

      // Navigate to home or order confirmation
      this.router.navigate(['/tabs/inicio']);
    }
  }

  closeCheckoutModal() {
    this.showCheckoutModal = false;
  }

  ngOnDestroy() {
    // Save cart to backend when component is destroyed (user navigates away)
    if (this.cartItems.length > 0) {
      this.persistCartToBackend().catch((error) => {
        console.error('Error saving cart on component destroy:', error);
      });
    }
  }

  private checkAuthStatus() {
    const token = localStorage.getItem('jwt_token');
    const userData = localStorage.getItem('userData');
    this.isLoggedIn = !!(token && userData);
    console.log('checkAuthStatus - token:', token, 'userData:', userData, 'isLoggedIn:', this.isLoggedIn);
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
