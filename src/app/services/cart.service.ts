import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  getCartItems() {
    return this.http.get(`${this.apiUrl}/getItemsCart`, {
      headers: this.authService.getAuthHeaders(),
      withCredentials: true
    });
  }

  addToCart(productId: number) {
    // Check if token is expired before making request
    if (this.authService.isTokenExpired()) {
      console.log('Token expired, cannot add to cart');
      // Clear expired token and return error
      this.authService.logout();
      return throwError(() => new Error('Token expired - please login again'));
    }

    const formData = new FormData();
    formData.append('id_producto', productId.toString());
    return this.http.post(`${this.apiUrl}/cart/addCart`, formData, {
      headers: this.authService.getAuthHeaders(),
      withCredentials: true
    });
  }

  saveCart(cartItems: any[]) {
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
    const token = localStorage.getItem('jwt_token');
    console.log('getAddresses - Direct localStorage check:', token);

    if (!token) {
      console.log('No JWT token found for getAddresses');
      return this.http.get(`${this.apiUrl}/getAddresses`, {
        withCredentials: true
      });
    }

    console.log('Using JWT auth for getAddresses');
    return this.http.get(`${this.apiUrl}/getAddresses`, {
      headers: { 'Authorization': `Bearer ${token}` },
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
}