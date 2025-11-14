import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonInput, IonTextarea, IonLabel, IonItem, ModalController, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close, callOutline, sendOutline } from 'ionicons/icons';

@Component({
  selector: 'app-contact-modal',
  templateUrl: './contact-modal.component.html',
  styleUrls: ['./contact-modal.component.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonInput, IonTextarea, IonLabel, IonItem, CommonModule, FormsModule],
  providers: [ModalController, ToastController]
})
export class ContactModalComponent {
  contactForm = {
    name: '',
    email: '',
    message: ''
  };

  constructor(private modalController: ModalController, private toastController: ToastController) {
    addIcons({ close, callOutline, sendOutline });
  }

  dismiss() {
    this.modalController.dismiss();
  }

  async submitForm() {
    if (!this.contactForm.name || !this.contactForm.email || !this.contactForm.message) {
      const toast = await this.toastController.create({
        message: 'Por favor, completa todos los campos',
        duration: 2000,
        position: 'bottom',
        cssClass: 'toast-warning'
      });
      await toast.present();
      return;
    }

    const toast = await this.toastController.create({
      message: 'Mensaje enviado correctamente',
      duration: 2000,
      position: 'bottom',
      cssClass: 'toast-success'
    });
    await toast.present();

    this.dismiss();
  }
}