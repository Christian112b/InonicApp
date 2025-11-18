import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonButton, IonSpinner } from '@ionic/angular/standalone';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AlertController, ToastController, ViewWillEnter } from '@ionic/angular';
import { environment } from '../../environments/environment';

const API_BASE_URL = environment.apiUrl;

@Component({
  selector: 'app-tab5',
  templateUrl: './tab5.page.html',
  styleUrls: ['./tab5.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonButton, IonSpinner, CommonModule, FormsModule]
})
export class Tab5Page implements OnInit, ViewWillEnter {

  ordersLoading: boolean = false;
  userOrders: any[] = [];

  constructor(
    private http: HttpClient,
    private alertController: AlertController,
    private toastController: ToastController
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
