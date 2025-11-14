import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonIcon } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { ModalController, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { shieldCheckmarkOutline, refreshOutline, documentTextOutline, callOutline, helpCircleOutline, chevronForwardOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tab5',
  templateUrl: './tab5.page.html',
  styleUrls: ['./tab5.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, CommonModule, FormsModule],
  providers: [ModalController, ToastController]
})
export class Tab5Page implements OnInit {

  constructor(private router: Router, private modalController: ModalController, private toastController: ToastController) {
    addIcons({
      shieldCheckmarkOutline,
      refreshOutline,
      documentTextOutline,
      callOutline,
      helpCircleOutline,
      chevronForwardOutline
    });
  }

  ngOnInit() {
  }

  async openPrivacyPolicy() {
    await this.router.navigate(['/privacy-policy']);
  }



  async openReturnsPolicy() {
    await this.router.navigate(['/returns-policy']);
  }

  async openTermsOfService() {
    await this.router.navigate(['/terms-of-service']);
  }

  async openContact() {
    await this.router.navigate(['/contact']);
  }

  async openFAQ() {
    await this.router.navigate(['/faq']);
  }

}
