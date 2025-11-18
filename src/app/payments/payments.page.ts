import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonSpinner, IonItem, IonLabel } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.page.html',
  styleUrls: ['./payments.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonSpinner, IonItem, IonLabel, CommonModule, FormsModule]
})
export class PaymentsPage implements OnInit {

  paymentMethods: any[] = [];
  isLoading: boolean = false;

  constructor(private router: Router) { }

  ngOnInit() {
    this.loadPaymentMethods();
  }

  loadPaymentMethods() {
    this.isLoading = true;
    // TODO: Load payment methods from API
    // For now, show empty state
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  closePage() {
    this.router.navigate(['/tabs/cuenta']);
  }

  addNewPaymentMethod() {
    // TODO: Navigate to add payment method page or open modal
    console.log('Add new payment method');
  }
}