import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close, shieldCheckmarkOutline } from 'ionicons/icons';

@Component({
  selector: 'app-privacy-policy-modal',
  templateUrl: './privacy-policy-modal.component.html',
  styleUrls: ['./privacy-policy-modal.component.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, CommonModule, FormsModule]
})
export class PrivacyPolicyModalComponent {

  constructor(private modalController: ModalController) {
    addIcons({ close, shieldCheckmarkOutline });
  }

  dismiss() {
    this.modalController.dismiss();
  }
}