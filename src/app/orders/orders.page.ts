import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonIcon, IonButton, IonSpinner } from '@ionic/angular/standalone';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastController, ViewWillEnter, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

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
    private router: Router
  ) {}

  ngOnInit() {
    // Initial load
  }

  ionViewWillEnter() {
    this.loadUserOrders();
  }

  private loadUserOrders() {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      this.showToast('Debes iniciar sesión para ver tus pedidos', 'warning');
      return;
    }

    this.ordersLoading = true;
    const userData = localStorage.getItem('userData');
    if (!userData) {
      this.ordersLoading = false;
      return;
    }

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

  toggleOrderTracking(order: any) {
    order.showTracking = !order.showTracking;
  }

  getTrackingSteps(order: any) {
    const orderDate = new Date(order.fecha_pedido);
    const steps = [];

    switch (order.estado) {
      case 'pendiente':
        steps.push(
          {
            icon: 'checkmark-circle',
            iconClass: 'completed',
            title: 'Pedido Recibido',
            description: 'Tu pedido ha sido registrado en nuestro sistema',
            date: orderDate.toLocaleDateString('es-MX')
          },
          {
            icon: 'card',
            iconClass: 'pending',
            title: 'Procesando Pago',
            description: 'Verificación del método de pago',
            date: null
          },
          {
            icon: 'cube',
            iconClass: 'pending',
            title: 'Preparando Productos',
            description: 'Recopilando y empacando tus productos',
            date: null
          }
        );
        break;

      case 'procesando':
        steps.push(
          {
            icon: 'checkmark-circle',
            iconClass: 'completed',
            title: 'Pedido Recibido',
            description: 'Tu pedido ha sido registrado en nuestro sistema',
            date: orderDate.toLocaleDateString('es-MX')
          },
          {
            icon: 'checkmark-circle',
            iconClass: 'completed',
            title: 'Pago Verificado',
            description: 'El pago ha sido procesado correctamente',
            date: new Date(orderDate.getTime() + 2 * 60 * 60 * 1000).toLocaleDateString('es-MX') // +2 hours
          },
          {
            icon: 'cube',
            iconClass: 'current',
            title: 'Preparando Productos',
            description: 'Estamos recopilando y empacando tus productos',
            date: null
          },
          {
            icon: 'send',
            iconClass: 'pending',
            title: 'Listo para Envío',
            description: 'El pedido estará listo para envío próximamente',
            date: null
          }
        );
        break;

      case 'enviado':
        steps.push(
          {
            icon: 'checkmark-circle',
            iconClass: 'completed',
            title: 'Pedido Recibido',
            description: 'Tu pedido ha sido registrado en nuestro sistema',
            date: orderDate.toLocaleDateString('es-MX')
          },
          {
            icon: 'checkmark-circle',
            iconClass: 'completed',
            title: 'Pago Verificado',
            description: 'El pago ha sido procesado correctamente',
            date: new Date(orderDate.getTime() + 2 * 60 * 60 * 1000).toLocaleDateString('es-MX')
          },
          {
            icon: 'checkmark-circle',
            iconClass: 'completed',
            title: 'Productos Preparados',
            description: 'Tu pedido ha sido empacado y preparado',
            date: new Date(orderDate.getTime() + 6 * 60 * 60 * 1000).toLocaleDateString('es-MX') // +6 hours
          },
          {
            icon: 'send',
            iconClass: 'current',
            title: 'Enviado',
            description: `Tu pedido está en camino con Estafeta. Guía: ES${order.id_pedido}MX`,
            date: new Date(orderDate.getTime() + 8 * 60 * 60 * 1000).toLocaleDateString('es-MX') // +8 hours
          },
          {
            icon: 'home',
            iconClass: 'pending',
            title: 'Entrega',
            description: 'El pedido será entregado en tu dirección',
            date: null
          }
        );
        break;

      case 'entregado':
        steps.push(
          {
            icon: 'checkmark-circle',
            iconClass: 'completed',
            title: 'Pedido Recibido',
            description: 'Tu pedido ha sido registrado en nuestro sistema',
            date: orderDate.toLocaleDateString('es-MX')
          },
          {
            icon: 'checkmark-circle',
            iconClass: 'completed',
            title: 'Pago Verificado',
            description: 'El pago ha sido procesado correctamente',
            date: new Date(orderDate.getTime() + 2 * 60 * 60 * 1000).toLocaleDateString('es-MX')
          },
          {
            icon: 'checkmark-circle',
            iconClass: 'completed',
            title: 'Productos Preparados',
            description: 'Tu pedido ha sido empacado y preparado',
            date: new Date(orderDate.getTime() + 6 * 60 * 60 * 1000).toLocaleDateString('es-MX')
          },
          {
            icon: 'checkmark-circle',
            iconClass: 'completed',
            title: 'Enviado',
            description: `Tu pedido fue enviado con Estafeta. Guía: ES${order.id_pedido}MX`,
            date: new Date(orderDate.getTime() + 8 * 60 * 60 * 1000).toLocaleDateString('es-MX')
          },
          {
            icon: 'checkmark-circle',
            iconClass: 'completed',
            title: 'Entregado',
            description: '¡Tu pedido ha sido entregado exitosamente!',
            date: new Date(orderDate.getTime() + 24 * 60 * 60 * 1000).toLocaleDateString('es-MX') // +1 day
          }
        );
        break;

      case 'cancelado':
        steps.push(
          {
            icon: 'checkmark-circle',
            iconClass: 'completed',
            title: 'Pedido Recibido',
            description: 'Tu pedido ha sido registrado en nuestro sistema',
            date: orderDate.toLocaleDateString('es-MX')
          },
          {
            icon: 'close-circle',
            iconClass: 'cancelled',
            title: 'Pedido Cancelado',
            description: 'El pedido ha sido cancelado',
            date: new Date().toLocaleDateString('es-MX')
          }
        );
        break;

      default:
        steps.push(
          {
            icon: 'help-circle',
            iconClass: 'unknown',
            title: this.getStatusText(order.estado),
            description: 'Estado del pedido desconocido',
            date: orderDate.toLocaleDateString('es-MX')
          }
        );
    }

    return steps;
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