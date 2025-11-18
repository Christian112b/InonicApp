import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonSpinner, IonItem, IonLabel, IonInput } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { CartService } from '../services/cart.service';
import { ToastController } from '@ionic/angular';

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
  selector: 'app-addresses',
  templateUrl: './addresses.page.html',
  styleUrls: ['./addresses.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonSpinner, IonItem, IonLabel, IonInput, CommonModule, FormsModule]
})
export class AddressesPage implements OnInit {

  addresses: Address[] = [];
  isLoading: boolean = false;
  showNewAddressForm: boolean = false;

  // Form data for new address
  newAddress = {
    alias: '',
    street: '',
    neighborhood: '',
    city: '',
    state: '',
    postalCode: ''
  };

  isSavingAddress: boolean = false;

  constructor(
    private router: Router,
    private cartService: CartService,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.loadAddresses();
  }

  loadAddresses() {
    this.isLoading = true;
    this.cartService.getAddresses().subscribe({
      next: (data: any) => {
        this.addresses = data.direcciones || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading addresses:', error);
        this.isLoading = false;
        this.showToast('Error al cargar direcciones', 'error');
      }
    });
  }

  closePage() {
    this.router.navigate(['/tabs/cuenta']);
  }

  toggleNewAddressForm() {
    this.showNewAddressForm = !this.showNewAddressForm;
    if (!this.showNewAddressForm) {
      // Reset form when closing
      this.resetNewAddressForm();
    }
  }

  saveNewAddress() {
    // Validación completa de campos requeridos
    if (!this.newAddress.alias?.trim() ||
        !this.newAddress.street?.trim() ||
        !this.newAddress.neighborhood?.trim() ||
        !this.newAddress.city?.trim() ||
        !this.newAddress.state?.trim() ||
        !this.newAddress.postalCode) {
      this.showToast('Por favor complete todos los campos requeridos', 'warning');
      return;
    }

    // Validación del código postal (5 dígitos)
    const postalCodeStr = String(this.newAddress.postalCode || '').trim();
    if (postalCodeStr.length !== 5 || !/^\d{5}$/.test(postalCodeStr)) {
      this.showToast('El código postal debe tener exactamente 5 dígitos', 'warning');
      return;
    }

    // Validación de longitud máxima
    if (this.newAddress.alias.length > 50 ||
        this.newAddress.street.length > 100 ||
        this.newAddress.neighborhood.length > 100 ||
        this.newAddress.city.length > 100 ||
        this.newAddress.state.length > 100 ||
        postalCodeStr.length > 5) {
      this.showToast('Uno o más campos exceden la longitud máxima permitida', 'warning');
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

    this.isSavingAddress = true;

    this.cartService.addAddress(addressData).subscribe({
      next: (response: any) => {
        this.isSavingAddress = false;

        if (response.ok) {
          this.showToast('Dirección agregada correctamente', 'success');
          this.loadAddresses();
          this.showNewAddressForm = false;
          this.resetNewAddressForm();
        } else {
          this.showToast('Error: ' + (response.message || 'No se pudo agregar la dirección'), 'error');
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

        this.showToast(errorMessage, 'error');
      }
    });
  }

  private resetNewAddressForm() {
    this.newAddress = {
      alias: '',
      street: '',
      neighborhood: '',
      city: '',
      state: '',
      postalCode: ''
    };
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