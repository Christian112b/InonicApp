import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonButton, IonItem, IonLabel, IonList } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-tab5',
  templateUrl: './tab5.page.html',
  styleUrls: ['./tab5.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, CommonModule, FormsModule]
})
export class Tab5Page implements OnInit {

  constructor(
    private router: Router,
    private toastController: ToastController
  ) {}

  ngOnInit() {}

  openPrivacyPolicy() {
    // Navigate to privacy policy page
    this.router.navigate(['/privacy-policy']);
  }

  openReturnsPolicy() {
    // Navigate to returns policy page
    this.router.navigate(['/returns-policy']);
  }

  openTermsOfService() {
    // Navigate to terms of service page
    this.router.navigate(['/terms-of-service']);
  }

  openContact() {
    // Navigate to contact page
    this.router.navigate(['/contact']);
  }

  openFAQ() {
    // Navigate to FAQ page
    this.router.navigate(['/faq']);
  }

  async showDevelopmentToast() {
    const toast = await this.toastController.create({
      message: 'Esta funcionalidad está en desarrollo',
      duration: 2000,
      position: 'bottom',
      cssClass: 'toast-warning'
    });
    await toast.present();
  }
}
