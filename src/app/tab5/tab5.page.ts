import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonIcon } from '@ionic/angular/standalone';
import { ToastController, ModalController } from '@ionic/angular';
import { PrivacyPolicyModalComponent } from '../modals/privacy-policy-modal.component';
import { ReturnsPolicyModalComponent } from '../modals/returns-policy-modal.component';
import { TermsOfServiceModalComponent } from '../modals/terms-of-service-modal.component';

@Component({
  selector: 'app-tab5',
  templateUrl: './tab5.page.html',
  styleUrls: ['./tab5.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, CommonModule, FormsModule],
  providers: [ModalController]
})
export class Tab5Page implements OnInit {

  constructor(private toastController: ToastController, private modalController: ModalController) { }

  ngOnInit() {
  }

  async openPrivacyPolicy() {
    const modal = await this.modalController.create({
      component: PrivacyPolicyModalComponent,
      cssClass: 'policy-modal',
      backdropDismiss: true,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      handle: false
    });
    return await modal.present();
  }

  async openReturnsPolicy() {
    const modal = await this.modalController.create({
      component: ReturnsPolicyModalComponent,
      cssClass: 'policy-modal',
      backdropDismiss: true,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      handle: false
    });
    return await modal.present();
  }

  async openTermsOfService() {
    const modal = await this.modalController.create({
      component: TermsOfServiceModalComponent,
      cssClass: 'policy-modal',
      backdropDismiss: true,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      handle: false
    });
    return await modal.present();
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
