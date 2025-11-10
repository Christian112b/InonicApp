import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  

  private tokenKey = 'jwt_token';
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  login(credentials: any) {

    const formData = new FormData();
    formData.append('email', credentials.email);
    formData.append('password', credentials.password);
    return this.http.post(`${this.apiUrl}/validationLogin`, formData, {
      withCredentials: true
    }).pipe(
      tap((response: any) => {
        console.log('Login response:', response);
        if (response.token) {
          console.log('Saving JWT token:', response.token);
          this.saveToken(response.token);
        } else {
          console.log('No token in response');
        }
      })
    );
  }

  register(userData: any) {
    const formData = new FormData();
    formData.append('name', userData.name);
    formData.append('email', userData.email);
    formData.append('phone', userData.phone);
    formData.append('password', userData.password);
    return this.http.post(`${this.apiUrl}/registerUser`, formData, {
      withCredentials: true
    });
  }

  saveToken(token: string) {
    console.log('Saving JWT token to localStorage:', token);
    localStorage.setItem(this.tokenKey, token);
    console.log('Token saved, verifying:', localStorage.getItem(this.tokenKey));
  }

  getToken(): string | null {
    const token = localStorage.getItem(this.tokenKey);
    console.log('Getting JWT token from localStorage:', token);
    return token;
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
  }

  getAuthHeaders() {
    const token = this.getToken();
    return token ? new HttpHeaders({
      'Authorization': `Bearer ${token}`
    }) : new HttpHeaders();
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }

  checkAndRefreshAuth(): void {
    if (this.isTokenExpired()) {
      console.log('Token expired, clearing auth data');
      this.logout();
      // Optionally redirect to login or show message
    }
  }
}