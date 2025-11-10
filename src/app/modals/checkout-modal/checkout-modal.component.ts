import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { IonButton, IonIcon, IonInput, IonItem, IonLabel, IonRadioGroup, IonRadio } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close, card, cash, business, checkmark, add, remove } from 'ionicons/icons';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CartService } from '../../services/cart.service';
import { StripePaymentComponent } from '../stripe-payment/stripe-payment.component';

interface CartItem {
  id: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface Address {
  id: number;
  alias: string;
  calle: string;
  colonia: string;
  ciudad: string;
  estado: string;
  cp: string;
}

@Component({
  selector: 'app-checkout-modal',
  templateUrl: './checkout-modal.component.html',
  styleUrls: ['./checkout-modal.component.scss'],
  imports: [IonButton, IonIcon, IonInput, IonItem, IonLabel, IonRadioGroup, IonRadio, CommonModule, FormsModule, StripePaymentComponent]
})
export class CheckoutModalComponent implements OnInit, OnDestroy {
  @Input() cartItems: CartItem[] = [];
  @Input() cartTotal: number = 0;
  @Output() closeModal = new EventEmitter<void>();
  @Output() checkoutComplete = new EventEmitter<any>();

  // Tab management
  activeTab: number = 0;
  tabs = ['Resumen', 'Dirección', 'Pago', 'Confirmar'];

  // Data
  addresses: Address[] = [];
  selectedAddress: Address | null = null;
  couponCode: string = '';
  discount: number = 0;

  // Stripe payment data
  showStripeForm = false;
  stripePaymentData: any = null;

  // Watch for payment method changes
  private _selectedPaymentMethod: string = '';

  set selectedPaymentMethod(value: string) {
    this._selectedPaymentMethod = value;
    this.onPaymentMethodChange();
  }

  get selectedPaymentMethod(): string {
    return this._selectedPaymentMethod;
  }

  // Form data for new address
  newAddress = {
    alias: '',
    street: '',
    neighborhood: '',
    city: '',
    state: '',
    postalCode: ''
  };

  // Loading states
  isLoadingAddresses = false;
  isProcessingPayment = false;
  showNewAddressForm = false;

  constructor(private http: HttpClient, private cartService: CartService) {
    addIcons({ close, card, cash, business, checkmark, add, remove });
  }

  ngOnInit() {
    // Small delay to ensure token is available
    setTimeout(() => {
      this.loadAddresses();
    }, 100);
  }

  // Tab navigation
  setActiveTab(index: number) {
    this.activeTab = index;
  }

  nextTab() {
    if (this.activeTab < this.tabs.length - 1) {
      this.activeTab++;
    }
  }

  prevTab() {
    if (this.activeTab > 0) {
      this.activeTab--;
    }
  }

  // Address management
  loadAddresses() {
    this.isLoadingAddresses = true;
    this.cartService.getAddresses().subscribe({
      next: (data: any) => {
        this.addresses = data.direcciones || [];
        this.isLoadingAddresses = false;
      },
      error: (error) => {
        console.error('Error loading addresses:', error);
        this.isLoadingAddresses = false;
      }
    });
  }

  selectAddress(address: Address) {
    this.selectedAddress = address;
  }

  toggleNewAddressForm() {
    console.log('Toggling new address form, current state:', this.showNewAddressForm);
    this.showNewAddressForm = !this.showNewAddressForm;
    console.log('New state:', this.showNewAddressForm);
  }

  saveNewAddress() {
    if (!this.newAddress.alias || !this.newAddress.street || !this.newAddress.postalCode) {
      return;
    }

    const addressData = {
      alias: this.newAddress.alias,
      street: this.newAddress.street,
      neighborhood: this.newAddress.neighborhood,
      city: this.newAddress.city,
      state: this.newAddress.state,
      postalCode: this.newAddress.postalCode
    };

    this.cartService.addAddress(addressData).subscribe({
      next: (response: any) => {
        if (response.ok) {
          this.loadAddresses();
          this.showNewAddressForm = false;
          // Reset form
          this.newAddress = { alias: '', street: '', neighborhood: '', city: '', state: '', postalCode: '' };
        }
      },
      error: (error) => {
        console.error('Error saving address:', error);
      }
    });
  }

  // Payment processing
  processPayment() {
    if (!this.selectedAddress || !this.selectedPaymentMethod) {
      return;
    }

    // If credit card is selected, check if we have stripe payment data
    if (this.selectedPaymentMethod === '1' && !this.stripePaymentData) {
      alert('Por favor complete los datos de la tarjeta');
      return;
    }

    this.isProcessingPayment = true;

    // Calculate final amounts
    const subtotal = this.cartTotal / 1.16;
    const iva = this.cartTotal - subtotal;
    const total = this.cartTotal - this.discount;

    const paymentData = {
      amount: Math.round(total * 100), // Convert to cents
      method_id: this.selectedPaymentMethod,
      direccion_id: this.selectedAddress.id,
      cupon_id: null, // TODO: implement coupon logic
      payment_method_id: this.stripePaymentData?.paymentMethodId // For Stripe payments
    };

    this.cartService.createPaymentIntent(paymentData).subscribe({
      next: (response: any) => {
        this.isProcessingPayment = false;
        if (response.ok) {
          this.checkoutComplete.emit({
            success: true,
            paymentIntent: response.clientSecret,
            orderData: {
              items: this.cartItems,
              address: this.selectedAddress,
              paymentMethod: this.selectedPaymentMethod,
              cardInfo: this.stripePaymentData ? {
                last4: this.stripePaymentData.last4,
                brand: this.stripePaymentData.brand
              } : null,
              totals: { subtotal, iva, discount: this.discount, total }
            }
          });
        }
      },
      error: (error) => {
        console.error('Payment error:', error);
        this.isProcessingPayment = false;
      }
    });
  }

  onPaymentMethodChange() {
    // Show Stripe form when credit card is selected
    this.showStripeForm = this.selectedPaymentMethod === '1';
    // Reset stripe payment data when changing payment method
    if (!this.showStripeForm) {
      this.stripePaymentData = null;
    }
  }

  onStripePaymentSuccess(paymentData: any) {
    console.log('Stripe payment success:', paymentData);
    this.stripePaymentData = paymentData;
  }

  onStripePaymentError(error: string) {
    console.error('Stripe payment error:', error);
    alert('Error en el pago: ' + error);
  }

  // Validation
  canProceed(): boolean {
    switch (this.activeTab) {
      case 0: return this.cartItems.length > 0;
      case 1: return !!this.selectedAddress;
      case 2: return !!this.selectedPaymentMethod;
      case 3: return !!this.selectedAddress && !!this.selectedPaymentMethod;
      default: return false;
    }
  }

  // Utility methods
  getSubtotal(): number {
    return this.cartTotal / 1.16;
  }

  getIVA(): number {
    return this.cartTotal - this.getSubtotal();
  }

  getFinalTotal(): number {
    return this.cartTotal - this.discount;
  }

  ngOnDestroy() {
    // Close modal when component is destroyed (e.g., when navigating away)
    this.closeModal.emit();
  }

  close() {
    this.closeModal.emit();
  }
}
