import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonIcon } from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { shieldCheckmarkOutline, refreshOutline, documentTextOutline, callOutline, helpCircleOutline, chevronForwardOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tab5',
  templateUrl: './tab5.page.html',
  styleUrls: ['./tab5.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, CommonModule, FormsModule],
  providers: []
})
export class Tab5Page implements OnInit {

  constructor(private toastController: ToastController, private router: Router) {
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
    this.showDevelopmentToast('Contactanos');
  }

  async openFAQ() {
    this.showDevelopmentToast('Preguntas Frecuentes');
  }



  private async showDevelopmentToast(message: string) {
    const toast = await this.toastController.create({
      message: `${message} - Esta funcionalidad está en desarrollo`,
      duration: 2000,
      position: 'bottom',
      cssClass: 'toast-warning',
      buttons: [
        {
          text: 'OK',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

}
