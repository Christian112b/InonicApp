import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface CartItem {
  id: number;
  name: string;
  image: string;
  quantity: number;
  price: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = environment.apiUrl;
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  public cartItems$ = this.cartItemsSubject.asObservable();
  private readonly CART_STORAGE_KEY = 'local_cart';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.loadCartFromStorage();
  }

  // Local cart management methods
  private loadCartFromStorage(): void {
    const storedCart = localStorage.getItem(this.CART_STORAGE_KEY);
    if (storedCart) {
      try {
        const cartItems = JSON.parse(storedCart);
        this.cartItemsSubject.next(cartItems);
      } catch (error) {
        console.error('Error loading cart from storage:', error);
        this.cartItemsSubject.next([]);
      }
    }
  }

  private saveCartToStorage(cartItems: CartItem[]): void {
    localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(cartItems));
  }

  getLocalCartItems(): CartItem[] {
    return this.cartItemsSubject.value;
  }

  addToLocalCart(product: CartItem): void {
    const currentItems = this.getLocalCartItems();
    const existingItem = currentItems.find(item => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      currentItems.push({ ...product, quantity: 1 });
    }

    this.cartItemsSubject.next([...currentItems]);
    this.saveCartToStorage(currentItems);
  }

  removeFromLocalCart(productId: number): void {
    const currentItems = this.getLocalCartItems().filter(item => item.id !== productId);
    this.cartItemsSubject.next(currentItems);
    this.saveCartToStorage(currentItems);
  }

  updateLocalCartItemQuantity(productId: number, quantity: number): void {
    const currentItems = this.getLocalCartItems();
    const item = currentItems.find(item => item.id === productId);

    if (item) {
      if (quantity <= 0) {
        this.removeFromLocalCart(productId);
      } else {
        item.quantity = quantity;
        this.cartItemsSubject.next([...currentItems]);
        this.saveCartToStorage(currentItems);
      }
    }
  }

  clearLocalCart(): void {
    this.cartItemsSubject.next([]);
    localStorage.removeItem(this.CART_STORAGE_KEY);
  }

  // Sync methods with backend
  syncCartWithBackend(): Observable<any> {
    const localItems = this.getLocalCartItems();
    if (localItems.length === 0) {
      return this.getCartItems();
    }

    // Convert local items to backend format
    const backendItems = localItems.map(item => ({
      id: item.id,
      quantity: item.quantity,
      price: item.price
    }));

    return this.saveCart(backendItems);
  }

  loadCartFromBackend(): Observable<any> {
    return this.getCartItems();
  }

  getCartItems() {
    // Send JWT headers and session cookies for cart operations
    return this.http.get(`${this.apiUrl}/getItemsCart`, {
      headers: this.authService.getAuthHeaders(),
      withCredentials: true
    });
  }

  // Enhanced getCartItems that merges local and backend
  getMergedCartItems(): Observable<CartItem[]> {
    return new Observable(observer => {
      this.getCartItems().subscribe({
        next: (response: any) => {
          if (response.ok && response.items) {
            // Backend has items, use them and update local storage
            this.cartItemsSubject.next(response.items);
            this.saveCartToStorage(response.items);
            observer.next(response.items);
          } else {
            // Backend empty, use local cart
            observer.next(this.getLocalCartItems());
          }
          observer.complete();
        },
        error: (error) => {
          // Backend error, use local cart
          observer.next(this.getLocalCartItems());
          observer.complete();
        }
      });
    });
  }

  // Sync local cart to backend after login
  syncLocalCartAfterLogin(): Observable<any> {
    const localItems = this.getLocalCartItems();
    if (localItems.length > 0) {
      const backendItems = localItems.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price
      }));
      return this.saveCart(backendItems);
    }
    return this.getCartItems(); // Just load from backend if local is empty
  }

  // Clear cart on logout
  clearCartOnLogout(): void {
    this.clearLocalCart();
  }

  addToCart(productId: number, productData?: { name: string, image: string, price: number }) {
    // Add to local cart immediately for better UX
    if (productData) {
      this.addToLocalCart({
        id: productId,
        name: productData.name,
        image: productData.image,
        price: productData.price,
        quantity: 1
      });
    }

    // Check if token is expired before making request
    if (this.authService.isTokenExpired()) {
      // Don't logout here, just don't sync
      return throwError(() => new Error('Token expired - cart saved locally'));
    }

    const formData = new FormData();
    formData.append('id_producto', productId.toString());
    // Send JWT headers and session cookies for cart operations
    return this.http.post(`${this.apiUrl}/addCart`, formData, {
      headers: this.authService.getAuthHeaders(),
      withCredentials: true
    });
  }

  saveCart(cartItems: any[]) {
    // Send JWT headers and session cookies for cart operations
    return this.http.post(`${this.apiUrl}/saveCart`,
      { items: cartItems },
      {
        headers: this.authService.getAuthHeaders(),
        withCredentials: true
      }
    );
  }

  checkSession() {
    return this.http.get(`${this.apiUrl}/check-session`, {
      headers: this.authService.getAuthHeaders(),
      withCredentials: true
    });
  }

  getAddresses() {
    // Send JWT headers and session cookies for cart operations
    return this.http.get(`${this.apiUrl}/getAddresses`, {
      headers: this.authService.getAuthHeaders(),
      withCredentials: true
    });
  }

  addAddress(addressData: any) {
    return this.http.post(`${this.apiUrl}/api/address/add`, addressData, {
      headers: this.authService.getAuthHeaders(),
      withCredentials: true
    });
  }

  createPaymentIntent(paymentData: any) {
    return this.http.post(`${this.apiUrl}/create-payment-intent`, paymentData, {
      headers: this.authService.getAuthHeaders(),
      withCredentials: true
    });
  }

  // Utility methods for cart calculations
  getCartItemCount(): number {
    return this.getLocalCartItems().reduce((total, item) => total + item.quantity, 0);
  }

  getCartTotal(): number {
    return this.getLocalCartItems().reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  // Clear cart after successful payment (backend also clears it)
  clearCartAfterPayment(): void {
    this.clearLocalCart();
  }
}