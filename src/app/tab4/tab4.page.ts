import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonButton, IonInput, IonCheckbox, IonLabel, IonSpinner } from '@ionic/angular/standalone';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

// Environment configuration
// const API_BASE_URL = 'http://localhost:5000'; // Localhost URL for development
const API_BASE_URL = 'https://backend-app-x7k2.zeabur.app/'; // Production URL

interface LoginData {
  email: string;
  password: string;
  remember: boolean;
}

interface RegisterData {
  name: string;
  apellido: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonButton, IonInput, IonCheckbox, IonLabel, IonSpinner, CommonModule, FormsModule]
})
export class Tab4Page implements OnInit {
  // Auth state
  isLoggedIn: boolean = false;
  userName: string = '';
  userEmail: string = '';

  // Modal states
  showLoginModal: boolean = false;
  showRegisterModal: boolean = false;
  showOrdersModal: boolean = false;

  // Form data
  loginData: LoginData = {
    email: '',
    password: '',
    remember: false
  };

  registerData: RegisterData = {
    name: '',
    apellido: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  };

  // UI states
  isLoading: boolean = false;
  isRegisterLoading: boolean = false;
  ordersLoading: boolean = false;
  showPassword: boolean = false;
  showRegisterPassword: boolean = false;
  showConfirmPassword: boolean = false;
  loginSuccess: boolean = false;
  userOrders: any[] = [];

  constructor(
    private http: HttpClient,
    private alertController: AlertController,
    private toastController: ToastController,
    private router: Router
  ) {
  }

  ngOnInit() {
    this.checkAuthStatus();
    this.checkRememberMe();
  }

  private checkAuthStatus() {
    const token = localStorage.getItem('jwt_token');
    const userData = localStorage.getItem('userData');

    if (token && userData) {
      // Check if token is still valid
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);

        if (payload.exp > currentTime) {
          const user = JSON.parse(userData);
          this.isLoggedIn = true;
          this.userName = user.name;
          this.userEmail = user.email;
        } else {
          // Token expired, clear it
          localStorage.removeItem('jwt_token');
          localStorage.removeItem('userData');
        }
      } catch (error) {
        // Invalid token, clear it
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('userData');
      }
    }
  }

  private checkRememberMe() {
    const rememberMe = localStorage.getItem('rememberMe');
    const savedEmail = localStorage.getItem('savedEmail');

    if (rememberMe === 'true' && savedEmail) {
      this.loginData.email = savedEmail;
      this.loginData.remember = true;
    }
  }

  // Modal controls
  openLoginModal() {
    this.showLoginModal = true;
    this.resetLoginForm();
  }

  closeLoginModal() {
    this.showLoginModal = false;
    this.resetLoginForm();
  }

  openRegisterModal() {
    this.showRegisterModal = true;
    this.resetRegisterForm();
  }

  closeRegisterModal() {
    this.showRegisterModal = false;
    this.resetRegisterForm();
  }

  openOrdersModal() {
    this.showOrdersModal = true;
    this.loadUserOrders();
  }

  closeOrdersModal() {
    this.showOrdersModal = false;
    this.userOrders = [];
  }

  // Password visibility toggles
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleRegisterPasswordVisibility() {
    this.showRegisterPassword = !this.showRegisterPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // Form resets
  private resetLoginForm() {
    this.loginData = {
      email: '',
      password: '',
      remember: false
    };
    this.isLoading = false;
  }

  private resetRegisterForm() {
    this.registerData = {
      name: '',
      apellido: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    };
    this.isRegisterLoading = false;
  }

  // Authentication methods
  async login() {
    if (!this.loginData.email || !this.loginData.password) {
      this.showToast('Por favor completa todos los campos', 'warning');
      return;
    }

    this.isLoading = true;

    try {
      // Create FormData to match Flask's request.form
      const formData = new FormData();
      formData.append('email', this.loginData.email);
      formData.append('password', this.loginData.password);

      const response = await this.http.post(`${API_BASE_URL}/validationLogin`, formData, { withCredentials: true }).toPromise() as any;

      if (response.token) {
        // Login successful
        const userData = {
          id: response.user?.id_usuario,
          name: response.user?.name || 'Usuario',
          email: response.user?.email || this.loginData.email
        };

        // Store auth data
        localStorage.setItem('jwt_token', response.token);
        localStorage.setItem('userData', JSON.stringify(userData));

        // Handle remember me functionality
        if (this.loginData.remember) {
          localStorage.setItem('rememberMe', 'true');
          localStorage.setItem('savedEmail', this.loginData.email);
        } else {
          localStorage.removeItem('rememberMe');
          localStorage.removeItem('savedEmail');
        }

        this.isLoggedIn = true;
        this.userName = userData.name;
        this.userEmail = userData.email;

        // Fetch order count
        this.fetchOrderCount();

        // Emit auth changed event for other components
        const authEvent = new CustomEvent('authChanged');
        window.dispatchEvent(authEvent);

        // Animation feedback instead of toast
        this.loginSuccess = true;
        setTimeout(() => {
          this.loginSuccess = false;
          this.closeLoginModal();
        }, 1500); // Show animation for 1.5 seconds
      } else {
        this.showToast(response.message || 'Error en el login', 'error');
      }
    } catch (error: any) {
      if (error.status === 401) {
        this.showToast('Usuario no encontrado', 'error');
      } else if (error.status === 403) {
        this.showToast('Contraseña incorrecta', 'error');
      } else if (error.status === 400) {
        this.showToast(error.error?.message || 'Datos inválidos', 'error');
      } else {
        this.showToast('Error al iniciar sesión', 'error');
      }
    } finally {
      this.isLoading = false;
    }
  }

  async register() {
    if (!this.registerData.name || !this.registerData.email || !this.registerData.phone || !this.registerData.password || !this.registerData.confirmPassword) {
      this.showToast('Por favor completa todos los campos', 'warning');
      return;
    }

    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.showToast('Las contraseñas no coinciden', 'error');
      return;
    }

    // Phone validation
    const phoneRegex = /^\+?\d{10,15}$/;
    const cleanPhone = this.registerData.phone.replace(/[\s\-\(\)]/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      this.showToast('Formato de teléfono inválido', 'warning');
      return;
    }

    // Password validation to match backend requirements
    if (this.registerData.password.length < 8) {
      this.showToast('La contraseña debe tener al menos 8 caracteres', 'warning');
      return;
    }

    if (!/[A-Z]/.test(this.registerData.password)) {
      this.showToast('La contraseña debe contener al menos una letra mayúscula', 'warning');
      return;
    }

    if (!/[a-z]/.test(this.registerData.password)) {
      this.showToast('La contraseña debe contener al menos una letra minúscula', 'warning');
      return;
    }

    if (!/\d/.test(this.registerData.password)) {
      this.showToast('La contraseña debe contener al menos un número', 'warning');
      return;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(this.registerData.password)) {
      this.showToast('La contraseña debe contener al menos un carácter especial', 'warning');
      return;
    }

    this.isRegisterLoading = true;

    // Simular registro para desarrollo
    setTimeout(() => {
      // Simular validación de email único
      const existingEmails = ['user@test.com', 'admin@costanzo.com', 'usuario@costanzo.com', 'cliente@costanzo.com'];

      if (existingEmails.includes(this.registerData.email)) {
        this.showToast('El correo ya está registrado', 'error');
        this.isRegisterLoading = false;
        return;
      }

      // Registration successful
      const userData = {
        name: this.registerData.name,
        email: this.registerData.email
      };

      // Store auth data
      localStorage.setItem('authToken', 'simulated-jwt-token-' + Date.now());
      localStorage.setItem('userData', JSON.stringify(userData));

      this.isLoggedIn = true;
      this.userName = userData.name;
      this.userEmail = userData.email;

      // Emit auth changed event for other components
      const authEvent = new CustomEvent('authChanged');
      window.dispatchEvent(authEvent);

      this.showToast('¡Registro exitoso!', 'success');
      this.closeRegisterModal();
      this.isRegisterLoading = false;
    }, 2000); // Simular delay de 2 segundos

    // Real backend registration
    try {
      // Create FormData to match Flask's request.form
      const formData = new FormData();
      formData.append('name', this.registerData.name);
      formData.append('apellido', this.registerData.apellido);
      formData.append('email', this.registerData.email);
      formData.append('phone', this.registerData.phone);
      formData.append('password', this.registerData.password);

      const response = await this.http.post(`${API_BASE_URL}/registerUser`, formData).toPromise() as any;

      if (response.status === 200) {
        // Registration successful
        const userData = {
          id: response.user?.id_usuario,
          name: response.user?.name || this.registerData.name,
          email: response.user?.email || this.registerData.email
        };

        // Store auth data if token provided
        if (response.token) {
          localStorage.setItem('jwt_token', response.token);
        }
        localStorage.setItem('userData', JSON.stringify(userData));

        this.isLoggedIn = true;
        this.userName = userData.name;
        this.userEmail = userData.email;

        // Emit auth changed event for other components
        const authEvent = new CustomEvent('authChanged');
        window.dispatchEvent(authEvent);

        this.showToast('¡Registro exitoso!', 'success');
        this.closeRegisterModal();
      } else {
        this.showToast(response.message || 'Error en el registro', 'error');
      }
    } catch (error: any) {
      if (error.status === 409) {
        this.showToast('El correo ya está registrado', 'error');
      } else if (error.status === 400) {
        this.showToast(error.error?.message || 'Datos inválidos', 'error');
      } else {
        this.showToast('Error al registrarse', 'error');
      }
    } finally {
      this.isRegisterLoading = false;
    }
  }

  async logout() {
    const alert = await this.alertController.create({
      header: 'Cerrar Sesión',
      message: '¿Estás seguro de que quieres cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Cerrar Sesión',
          role: 'destructive',
          handler: () => {
            this.performLogout();
          }
        }
      ]
    });

    await alert.present();
  }

  private performLogout() {
    // Clear auth data
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('userData');

    // Keep remember me data if it was set
    const rememberMe = localStorage.getItem('rememberMe');
    if (rememberMe !== 'true') {
      localStorage.removeItem('rememberMe');
      localStorage.removeItem('savedEmail');
    }

    this.isLoggedIn = false;
    this.userName = '';
    this.userEmail = '';

    // Emit auth changed event for other components
    const authEvent = new CustomEvent('authChanged');
    window.dispatchEvent(authEvent);

    this.showToast('Sesión cerrada exitosamente', 'success');
  }

  goToOrders() {
    // Navigate to tab5 (orders page)
    this.router.navigate(['/tabs/mas']);
  }

  async showDevelopmentToast() {
    const toast = await this.toastController.create({
      message: 'Esta funcionalidad está en desarrollo',
      duration: 2000,
      position: 'bottom',
      cssClass: 'toast-warning',
      buttons: [
        {
          text: 'OK',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

  getOrderCount(): number {
    // Get from local storage or API
    const cachedCount = localStorage.getItem('userOrderCount');
    if (cachedCount) {
      return parseInt(cachedCount, 10);
    }
    // If no cache, fetch from API
    this.fetchOrderCount();
    return 0; // Return 0 initially, will update when API responds
  }

  private fetchOrderCount() {
    if (!this.isLoggedIn || !this.userEmail) return;

    const token = localStorage.getItem('jwt_token');
    if (!token) return;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get(`${API_BASE_URL}/user-orders`, { headers }).subscribe({
      next: (response: any) => {
        if (response.success && response.orders) {
          const count = response.orders.length;
          localStorage.setItem('userOrderCount', count.toString());
          // Trigger change detection
          this.ngOnInit();
        }
      },
      error: (error) => {
        console.error('Error fetching order count:', error);
      }
    });
  }

  getFavoritesCount(): number {
    // TODO: Get from API or local storage
    return 0;
  }

  getRating(): string {
    // TODO: Get from API or calculate from reviews
    return '5.0';
  }

  private loadUserOrders() {
    if (!this.isLoggedIn || !this.userEmail) return;

    const token = localStorage.getItem('jwt_token');
    if (!token) return;

    this.ordersLoading = true;
    const userData = localStorage.getItem('userData');
    if (!userData) {
      this.ordersLoading = false;
      return;
    }

    const user = JSON.parse(userData);
    const userId = user.id;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get(`${API_BASE_URL}/user-orders`, { headers }).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.userOrders = response.orders || [];
        } else {
          this.userOrders = [];
        }
        this.ordersLoading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.userOrders = [];
        this.ordersLoading = false;
        this.showToast('Error al cargar pedidos', 'error');
      }
    });
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pendiente': 'Pendiente',
      'procesando': 'Procesando',
      'enviado': 'Enviado',
      'entregado': 'Entregado',
      'cancelado': 'Cancelado'
    };
    return statusMap[status] || status;
  }

  async cancelOrder(orderId: number) {
    const alert = await this.alertController.create({
      header: 'Cancelar Pedido',
      message: '¿Estás seguro de que quieres cancelar este pedido?',
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        },
        {
          text: 'Sí, Cancelar',
          role: 'destructive',
          handler: () => {
            this.performOrderCancellation(orderId);
          }
        }
      ]
    });

    await alert.present();
  }

  private performOrderCancellation(orderId: number) {
    const token = localStorage.getItem('jwt_token');
    if (!token) return;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    this.http.put(`${API_BASE_URL}/update-order/${orderId}`, { status: 'cancelado' }, { headers }).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.showToast('Pedido cancelado exitosamente', 'success');
          this.loadUserOrders(); // Reload orders
        } else {
          this.showToast('Error al cancelar pedido', 'error');
        }
      },
      error: (error) => {
        console.error('Error canceling order:', error);
        this.showToast('Error al cancelar pedido', 'error');
      }
    });
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
