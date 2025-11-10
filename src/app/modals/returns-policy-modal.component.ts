import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, ModalController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-returns-policy-modal',
  templateUrl: './returns-policy-modal.component.html',
  styleUrls: ['./returns-policy-modal.component.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, CommonModule, FormsModule]
})
export class ReturnsPolicyModalComponent {

  constructor(private modalController: ModalController) { }

  dismiss() {
    this.modalController.dismiss();
  }
}