import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonSpinner, IonButton, IonRouterLink } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cube, gift, restaurant, leaf, star, snow, cart, addCircle, trash } from 'ionicons/icons';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ToastController } from '@ionic/angular';

// Environment configuration
const API_BASE_URL = 'http://localhost:5050';

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
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonSpinner, IonButton, IonRouterLink, CommonModule],
})
export class Tab3Page implements OnInit, OnDestroy {
  public cartItems: CartItem[] = [];
  public cartTotal: number = 0;
  public cartItemCount: number = 0;
  public isLoadingCart: boolean = false;
  public isLoggedIn: boolean = false;

  constructor(private http: HttpClient, private toastController: ToastController) {
    addIcons({ cube, gift, restaurant, leaf, star, snow, cart, addCircle, trash });
  }

  ngOnInit() {
    this.checkAuthStatus();
    this.loadCartFromStorage();
    this.updateCartUI();

    // Listen for cart refresh events from tab bar
    window.addEventListener('refreshCartData', () => {
      this.updateCartUI();
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
        console.log('🛒 Carrito guardado en backend (simulado):', this.cartItems);
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
    console.log('🔄 Iniciando carga del carrito...');

    // Simular datos del carrito para desarrollo
    setTimeout(() => {
      // Simular respuesta del backend con datos de ejemplo
      const mockData = {
        ok: true,
        items: [
          {
            id: 1,
            name: 'Tornillo',
            image: '/assets/img/02Tornillo.jpg',
            price: '25.00',
            quantity: 2
          },
          {
            id: 2,
            name: 'Princesa Surtida',
            image: '/assets/img/09PrincesaSurtida.jpg',
            price: '30.00',
            quantity: 1
          },
          {
            id: 3,
            name: 'Duquesa',
            image: '/assets/img/DUQUESA-PRESENTACIONES.jpg',
            price: '28.00',
            quantity: 3
          }
        ]
      };

      console.log('📦 Respuesta simulada del carrito:', mockData);
      if (mockData.ok) {
        const items = (mockData.items || []).map((item: any) => ({
          id: item.id,
          name: item.name,
          image: item.image,
          price: parseFloat(item.price) || 0,
          quantity: item.quantity
        }));

        console.log('✅ Items procesados:', items);
        this.cartItems = items;
        this.updateCartTotals();
        this.saveCartToStorage();
      } else {
        console.warn('⚠️ Respuesta no OK:', mockData);
      }
      this.isLoadingCart = false;
    }, 1000); // Simular delay de 1 segundo

    // Código comentado para cuando tengas el backend listo:
    /*
    // Load cart from backend (uses Flask session, not JWT)
    this.http.get(`${API_BASE_URL}/getItemsCart`, { withCredentials: true }).subscribe({
      next: (data: any) => {
        console.log('📦 Respuesta del carrito:', data);
        if (data.ok) {
          const items = (data.items || []).map((item: any) => ({
            id: item.id,
            name: item.name,
            image: item.image,
            price: parseFloat(item.price) || 0,
            quantity: item.quantity
          }));

          console.log('✅ Items procesados:', items);
          this.cartItems = items;
          this.updateCartTotals();
          this.saveCartToStorage();
        } else {
          console.warn('⚠️ Respuesta no OK:', data);
        }
        this.isLoadingCart = false;
      },
      error: (error) => {
        console.error('❌ Error loading cart from backend:', error);
        this.showToast('Error al cargar el carrito desde el servidor. Usando datos locales.', 'error');
        // Fallback to localStorage if backend fails
        this.loadCartFromStorage();
        this.isLoadingCart = false;
      }
    });
    */
  }

  proceedToCheckout() {
    if (this.cartItems.length === 0) {
      alert('Tu carrito está vacío');
      return;
    }

    // Save cart to backend before proceeding to checkout
    this.persistCartToBackend().then(() => {
      console.log('Cart saved to backend, proceeding to checkout');
      // Open checkout modal (you would implement this)
      alert('Funcionalidad de checkout próximamente disponible');
    }).catch((error) => {
      console.error('Error saving cart before checkout:', error);
      // Still proceed to checkout even if save fails
      alert('Funcionalidad de checkout próximamente disponible');
    });
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
    const token = localStorage.getItem('authToken');
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
