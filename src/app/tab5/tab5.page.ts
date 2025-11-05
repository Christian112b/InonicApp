import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonIcon } from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-tab5',
  templateUrl: './tab5.page.html',
  styleUrls: ['./tab5.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, CommonModule, FormsModule]
})
export class Tab5Page implements OnInit {

  constructor(private toastController: ToastController) { }

  ngOnInit() {
  }

  async openPrivacyPolicy() {
    this.showDevelopmentToast('Política de Privacidad');
  }

  async openReturnsPolicy() {
    this.showDevelopmentToast('Políticas de Devolución');
  }

  async openTermsOfService() {
    this.showDevelopmentToast('Términos de Servicio');
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
