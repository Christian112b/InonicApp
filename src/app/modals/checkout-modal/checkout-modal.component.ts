import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { IonButton, IonIcon, IonInput, IonItem, IonLabel, IonRadioGroup, IonRadio, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close, card, cash, business, checkmark, add, remove, checkmarkCircle, bag, location, calculator } from 'ionicons/icons';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CartService } from '../../services/cart.service';
import { StripePaymentComponent } from '../stripe-payment/stripe-payment.component';
import { ViewChild } from '@angular/core';

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
  imports: [IonButton, IonIcon, IonInput, IonItem, IonLabel, IonRadioGroup, IonRadio, IonSpinner, CommonModule, FormsModule, StripePaymentComponent]
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
  isSavingAddress = false;
  showNewAddressForm = false;

  // Stripe component reference
  @ViewChild(StripePaymentComponent) stripeComponent!: StripePaymentComponent;

  constructor(private http: HttpClient, private cartService: CartService) {
    addIcons({ close, card, cash, business, checkmark, add, remove, checkmarkCircle, bag, location, calculator });
  }

  ngOnInit() {
    console.log('🛒 Checkout modal initialized');
    console.time('CheckoutModal-Init');

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
    // Validación completa de campos requeridos
    if (!this.newAddress.alias?.trim() ||
        !this.newAddress.street?.trim() ||
        !this.newAddress.neighborhood?.trim() ||
        !this.newAddress.city?.trim() ||
        !this.newAddress.state?.trim() ||
        !this.newAddress.postalCode) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    // Validación del código postal (5 dígitos)
    const postalCodeStr = String(this.newAddress.postalCode || '').trim();
    if (postalCodeStr.length !== 5 || !/^\d{5}$/.test(postalCodeStr)) {
      alert('El código postal debe tener exactamente 5 dígitos');
      return;
    }

    // Validación de longitud máxima
    if (this.newAddress.alias.length > 50 ||
        this.newAddress.street.length > 100 ||
        this.newAddress.neighborhood.length > 100 ||
        this.newAddress.city.length > 100 ||
        this.newAddress.state.length > 100 ||
        postalCodeStr.length > 5) {
      alert('Uno o más campos exceden la longitud máxima permitida');
      return;
    }

    const addressData = {
      alias: this.newAddress.alias.trim(),
      street: this.newAddress.street.trim(),
      neighborhood: this.newAddress.neighborhood.trim(),
      city: this.newAddress.city.trim(),
      state: this.newAddress.state.trim(),
      postalCode: postalCodeStr
    };

    console.log('Enviando datos de dirección:', addressData);

    this.isSavingAddress = true;

    this.cartService.addAddress(addressData).subscribe({
      next: (response: any) => {
        console.log('Respuesta del servidor:', response);
        this.isSavingAddress = false;

        if (response.ok) {
          alert('Dirección agregada correctamente');
          this.loadAddresses();
          this.showNewAddressForm = false;
          // Reset form
          this.newAddress = { alias: '', street: '', neighborhood: '', city: '', state: '', postalCode: '' };
        } else {
          alert('Error: ' + (response.message || 'No se pudo agregar la dirección'));
        }
      },
      error: (error: any) => {
        console.error('Error saving address:', error);
        this.isSavingAddress = false;

        let errorMessage = 'Error al guardar la dirección';

        if (error.status === 401) {
          errorMessage = 'Sesión expirada. Por favor inicie sesión nuevamente.';
        } else if (error.status === 400) {
          errorMessage = error.error?.message || 'Datos inválidos. Verifique la información.';
        } else if (error.status === 500) {
          errorMessage = 'Error interno del servidor. Intente nuevamente.';
        }

        alert(errorMessage);
      }
    });
  }

  // Payment processing
  async processPayment() {
    if (!this.selectedAddress || !this.selectedPaymentMethod) {
      return;
    }

    // If credit card is selected, create payment method first
    if (this.selectedPaymentMethod === '1') {
      if (!this.stripeComponent) {
        alert('Error: Componente de Stripe no disponible');
        return;
      }

      try {
        // Create payment method from Stripe component
        this.stripePaymentData = await this.stripeComponent.createPaymentMethod();
      } catch (error: any) {
        alert('Error con la tarjeta: ' + error.message);
        return;
      }
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
          // Clear local cart after successful payment
          this.cartService.clearCartAfterPayment();

          // Also clear backend cart to ensure it's empty (workaround for backend issue)
          this.cartService.saveCart([]).subscribe({
            next: () => console.log('Backend cart cleared'),
            error: (err) => console.warn('Could not clear backend cart:', err)
          });

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
    // Only reset stripe payment data when changing AWAY from credit card
    // Keep the data if user navigates back to credit card option
    if (!this.showStripeForm) {
      this.stripePaymentData = null;
    }
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
    console.timeEnd('CheckoutModal-Init');
    // Close modal when component is destroyed (e.g., when navigating away)
    this.closeModal.emit();
  }

  close() {
    console.log('🛒 Closing checkout modal');
    this.closeModal.emit();
  }
}
