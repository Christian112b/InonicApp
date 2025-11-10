import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, ModalController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-terms-of-service-modal',
  templateUrl: './terms-of-service-modal.component.html',
  styleUrls: ['./terms-of-service-modal.component.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, CommonModule, FormsModule]
})
export class TermsOfServiceModalComponent {

  constructor(private modalController: ModalController) { }

  dismiss() {
    this.modalController.dismiss();
  }
}