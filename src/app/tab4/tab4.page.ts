import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonButton, IonInput, IonCheckbox, IonLabel, IonSpinner } from '@ionic/angular/standalone';
import { HttpClient } from '@angular/common/http';
import { AlertController, ToastController } from '@ionic/angular';
import { environment } from '../../environments/environment';
import { addIcons } from 'ionicons';
import { personCircleOutline, logInOutline, personAddOutline, cartOutline, heartOutline, starOutline, locationOutline, cardOutline, notificationsOutline, helpCircleOutline, personOutline, receiptOutline, settingsOutline, logOutOutline, close, mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline, callOutline } from 'ionicons/icons';

// Environment configuration
const API_BASE_URL = 'http://localhost:5000'; // Localhost URL for development
// const API_BASE_URL = 'https://backend-app-x7k2.zeabur.app/'; // Production URL

interface LoginData {
  email: string;
  password: string;
  remember: boolean;
}

interface RegisterData {
  name: string;
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

  // Form data
  loginData: LoginData = {
    email: '',
    password: '',
    remember: false
  };

  registerData: RegisterData = {
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  };

  // UI states
  isLoading: boolean = false;
  isRegisterLoading: boolean = false;
  showPassword: boolean = false;
  showRegisterPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(
    private http: HttpClient,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({
      personCircleOutline,
      logInOutline,
      personAddOutline,
      cartOutline,
      heartOutline,
      starOutline,
      locationOutline,
      cardOutline,
      notificationsOutline,
      helpCircleOutline,
      personOutline,
      receiptOutline,
      settingsOutline,
      logOutOutline,
      close,
      mailOutline,
      lockClosedOutline,
      eyeOutline,
      eyeOffOutline,
      callOutline
    });
  }

  ngOnInit() {
    this.checkAuthStatus();
    this.checkRememberMe();
  }

  private checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');

    if (token && userData) {
      const user = JSON.parse(userData);
      this.isLoggedIn = true;
      this.userName = user.name;
      this.userEmail = user.email;
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
      console.log('Backend login response:', response);

      if (response.token) {
        // Login successful
        const userData = {
          name: response.user?.name || 'Usuario',
          email: response.user?.email || this.loginData.email
        };

        // Store auth data
        console.log('Storing JWT token:', response.token);
        localStorage.setItem('jwt_token', response.token);
        localStorage.setItem('userData', JSON.stringify(userData));
        console.log('Token saved to localStorage:', localStorage.getItem('jwt_token'));

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

        // Emit auth changed event for other components
        const authEvent = new CustomEvent('authChanged');
        window.dispatchEvent(authEvent);

        this.showToast('¡Inicio de sesión exitoso!', 'success');
        this.closeLoginModal();
      } else {
        this.showToast(response.message || 'Error en el login', 'error');
      }
    } catch (error: any) {
      console.error('Login error:', error);
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

    // Basic password validation (backend will do more thorough validation)
    if (this.registerData.password.length < 8) {
      this.showToast('La contraseña debe tener al menos 8 caracteres', 'warning');
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
      formData.append('email', this.registerData.email);
      formData.append('phone', this.registerData.phone);
      formData.append('password', this.registerData.password);

      const response = await this.http.post(`${API_BASE_URL}/registerUser`, formData).toPromise() as any;

      if (response.status === 200) {
        // Registration successful
        const userData = {
          name: this.registerData.name,
          email: this.registerData.email
        };

        // Store auth data if token provided
        if (response.token) {
          localStorage.setItem('authToken', response.token);
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
      console.error('Register error:', error);
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
    localStorage.removeItem('authToken');
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
    // TODO: Get from API or local storage
    return 0;
  }

  getFavoritesCount(): number {
    // TODO: Get from API or local storage
    return 0;
  }

  getRating(): string {
    // TODO: Get from API or calculate from reviews
    return '5.0';
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
