import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonIcon, IonButton, IonSpinner } from '@ionic/angular/standalone';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastController, ViewWillEnter, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { OrderDataService } from '../services/order-data.service';

const API_BASE_URL = environment.apiUrl;

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonIcon, IonButton, IonSpinner, CommonModule, FormsModule]
})
export class OrdersPage implements OnInit, ViewWillEnter {

  ordersLoading: boolean = false;
  userOrders: any[] = [];

  constructor(
    private http: HttpClient,
    private toastController: ToastController,
    private alertController: AlertController,
    private router: Router,
    private orderDataService: OrderDataService
  ) {}

  ngOnInit() {
    // Initial load
  }

  ionViewWillEnter() {
    // Check if we need to refresh orders (e.g., after placing a new order)
    const navigation = this.router.getCurrentNavigation();
    const shouldRefresh = navigation?.extras?.state?.['refreshOrders'] ||
                          navigation?.extras?.queryParams?.['refresh'];

    if (shouldRefresh) {
      console.log('🔄 [ORDERS] Refresh requested, invalidating cache');
      this.invalidateOrdersCache();
    }

    this.loadUserOrders();
  }

  private loadUserOrders() {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      this.showToast('Debes iniciar sesión para ver tus pedidos', 'warning');
      return;
    }

    const userData = localStorage.getItem('userData');
    if (!userData) {
      this.ordersLoading = false;
      return;
    }

    // Check cache first
    const cachedOrders = this.getCachedOrders();
    if (cachedOrders && !this.isCacheStale()) {
      console.log('📦 [ORDERS] Using cached orders');
      this.userOrders = cachedOrders;
      this.ordersLoading = false;
      return;
    }

    // Load from API if no cache or cache is stale
    console.log('🌐 [ORDERS] Loading orders from API');
    this.ordersLoading = true;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get(`${API_BASE_URL}/user-orders`, { headers }).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.userOrders = response.orders || [];
          this.cacheOrders(this.userOrders); // Cache the orders
          console.log('💾 [ORDERS] Orders cached');
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

  toggleOrderTracking(order: any) {
    console.log('🔄 [ORDERS] Starting navigation to order tracking');
    console.log('📦 [ORDERS] Order data:', order);

    try {
      // Only pass the data we actually need for tracking
      const minimalOrderData = {
        id_pedido: order.id_pedido,
        numero_pedido: order.numero_pedido,
        fecha_pedido: order.fecha_pedido,
        estado: order.estado
      };

      console.log('📝 [ORDERS] Minimal data prepared:', minimalOrderData);
      this.orderDataService.setOrderData(minimalOrderData);
      console.log('💾 [ORDERS] Data set in service');

      console.log('🧭 [ORDERS] Starting router navigation...');
      this.router.navigate(['/order-tracking']).then(success => {
        console.log('✅ [ORDERS] Navigation completed:', success);
      }).catch(error => {
        console.error('❌ [ORDERS] Navigation failed:', error);
      });

      // Check if app is still responsive after 5 seconds
      setTimeout(() => {
        console.log('⏰ [ORDERS] 5 seconds passed - app still responsive');
      }, 5000);

    } catch (error) {
      console.error('💥 [ORDERS] Error in toggleOrderTracking:', error);
    }
  }


  trackByOrderId(index: number, order: any): any {
    return order.id_pedido || order.numero_pedido;
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

  private getCachedOrders(): any[] | null {
    try {
      const cached = localStorage.getItem('userOrdersCache');
      if (cached) {
        const parsed = JSON.parse(cached);
        return parsed.orders || null;
      }
    } catch (error) {
      console.error('Error reading cached orders:', error);
    }
    return null;
  }

  private cacheOrders(orders: any[]): void {
    try {
      const cacheData = {
        orders: orders,
        timestamp: Date.now()
      };
      localStorage.setItem('userOrdersCache', JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error caching orders:', error);
    }
  }

  private isCacheStale(): boolean {
    try {
      const cached = localStorage.getItem('userOrdersCache');
      if (cached) {
        const parsed = JSON.parse(cached);
        const cacheTime = parsed.timestamp;
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds

        // Check if cache is older than 5 minutes
        return (now - cacheTime) > fiveMinutes;
      }
    } catch (error) {
      console.error('Error checking cache staleness:', error);
    }
    return true; // Consider stale if error
  }

  // Method to invalidate cache when a new order is placed
  invalidateOrdersCache(): void {
    console.log('🗑️ [ORDERS] Invalidating orders cache');
    localStorage.removeItem('userOrdersCache');
  }

  closePage() {
    this.router.navigate(['/tabs/cuenta']);
  }

  private async showToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'top',
      cssClass: `toast-${type}`
    });
    await toast.present();
  }
}