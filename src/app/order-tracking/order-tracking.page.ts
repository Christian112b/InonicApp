import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderDataService } from '../services/order-data.service';

@Component({
  selector: 'app-order-tracking',
  templateUrl: './order-tracking.page.html',
  styleUrls: ['./order-tracking.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonSpinner, CommonModule, FormsModule]
})
export class OrderTrackingPage implements OnInit, OnDestroy {

  order: any;
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderDataService: OrderDataService
  ) { }

  ngOnInit() {
    console.log('🚀 [TRACKING] OrderTrackingPage ngOnInit started');
    this.isLoading = true;

    try {
      // Subscribe to order data changes
      this.orderDataService.orderData$.subscribe(orderData => {
        console.log('📨 [TRACKING] Order data received from service:', orderData);
        this.order = orderData;
        this.isLoading = false; // Data loaded, stop loading

        if (this.order) {
          console.log('✅ [TRACKING] Order data loaded successfully:', this.order);
        } else {
          console.log('⚠️ [TRACKING] No order data received');
        }
      });

      console.log('🎯 [TRACKING] Subscription set up');

      // Check if component is still alive after 3 seconds
      setTimeout(() => {
        console.log('⏰ [TRACKING] 3 seconds passed - component still alive, isLoading:', this.isLoading);
      }, 3000);

    } catch (error) {
      console.error('💥 [TRACKING] Error in ngOnInit:', error);
      this.isLoading = false;
    }
  }

  trackByStep(index: number, step: any): any {
    return step.title + step.iconClass; // Unique identifier for each step
  }

  getTrackingSteps(order: any) {
    console.log('🔍 [TRACKING] getTrackingSteps called with order:', order);

    if (!order) {
      console.log('⚠️ [TRACKING] No order provided to getTrackingSteps');
      return [];
    }

    try {
      const orderDate = new Date(order.fecha_pedido);
      console.log('📅 [TRACKING] Order date parsed:', orderDate);
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

      console.log('✅ [TRACKING] Generated steps:', steps.length);
      return steps;
    } catch (error) {
      console.error('💥 [TRACKING] Error in getTrackingSteps:', error);
      return [];
    }
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

  ngOnDestroy() {
    // Clear the data when leaving the page
    this.orderDataService.clearOrderData();
  }

  closePage() {
    this.router.navigate(['/orders']);
  }

}
