import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-stripe-payment',
  templateUrl: './stripe-payment.component.html',
  styleUrls: ['./stripe-payment.component.scss'],
  imports: [IonButton, IonIcon, CommonModule]
})
export class StripePaymentComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() amount: number = 0; // Amount in cents
  @Output() paymentSuccess = new EventEmitter<any>();
  @Output() paymentError = new EventEmitter<string>();

  @ViewChild('cardElement', { static: true }) cardElement!: ElementRef;

  stripe: Stripe | null = null;
  private elements: StripeElements | null = null;
  private card: StripeCardElement | null = null;

  isLoading = false;
  isInitializingCard = true;
  errorMessage = '';

  async ngOnInit() {
    console.time('Stripe-Init');
    try {
      // Load Stripe
      this.stripe = await loadStripe(environment.stripePublishableKey);
      if (!this.stripe) {
        throw new Error('Stripe failed to initialize');
      }
      console.timeEnd('Stripe-Init');
    } catch (error) {
      console.timeEnd('Stripe-Init');
      console.error('Error loading Stripe:', error);
      this.errorMessage = 'Error al cargar Stripe';
    }
  }

  async ngAfterViewInit() {
    console.time('Stripe-Elements');

    // Wait a bit for Stripe to be fully loaded
    await new Promise(resolve => setTimeout(resolve, 100));

    if (this.stripe && this.cardElement) {
      try {
        // Create elements
        this.elements = this.stripe.elements();

        // Create card element
        this.card = this.elements.create('card', {
          style: {
            base: {
              fontSize: '16px',
              color: '#32325d',
              fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
              '::placeholder': {
                color: '#aab7c4'
              }
            }
          }
        });

        // Mount the card element
        this.card.mount(this.cardElement.nativeElement);

        // Listen for changes
        this.card.on('change', (event) => {
          if (event.error) {
            this.errorMessage = event.error.message;
          } else {
            this.errorMessage = '';
          }
        });

        console.log('Stripe card element mounted successfully');
        this.isInitializingCard = false;
      } catch (error) {
        console.error('Error mounting Stripe card element:', error);
        this.errorMessage = 'Error al inicializar el formulario de tarjeta';
        this.isInitializingCard = false;
      }
    } else {
      console.warn('Stripe or card element not available');
      if (!this.stripe) {
        this.errorMessage = 'Stripe no está disponible';
      }
      this.isInitializingCard = false;
    }
    console.timeEnd('Stripe-Elements');
  }

  ngOnDestroy() {
    if (this.card) {
      this.card.destroy();
    }
  }

  async processPayment() {
    if (!this.stripe) {
      this.paymentError.emit('Stripe no está inicializado. Verifica tu conexión a internet o desactiva extensiones de bloqueo de anuncios.');
      return;
    }

    if (!this.card) {
      this.paymentError.emit('El formulario de tarjeta no está listo. Inténtalo de nuevo.');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      // Create payment method
      const { error, paymentMethod } = await this.stripe.createPaymentMethod({
        type: 'card',
        card: this.card
      });

      if (error) {
        this.errorMessage = error.message || 'Error al procesar la tarjeta';
        this.paymentError.emit(this.errorMessage);
        return;
      }

      // Emit success with payment method
      this.paymentSuccess.emit({
        paymentMethodId: paymentMethod.id,
        last4: paymentMethod.card?.last4,
        brand: paymentMethod.card?.brand
      });

    } catch (error: any) {
      this.errorMessage = error.message || 'Error desconocido';
      this.paymentError.emit(this.errorMessage);
    } finally {
      this.isLoading = false;
    }
  }
}