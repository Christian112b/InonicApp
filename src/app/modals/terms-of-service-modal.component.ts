import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close, documentTextOutline } from 'ionicons/icons';

@Component({
  selector: 'app-terms-of-service-modal',
  templateUrl: './terms-of-service-modal.component.html',
  styleUrls: ['./terms-of-service-modal.component.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, CommonModule, FormsModule]
})
export class TermsOfServiceModalComponent {
  @Input() content: string = '';

  constructor(private modalController: ModalController) {
    console.time('TermsModal-Init');
    addIcons({ close, documentTextOutline });
  }

  dismiss() {
    console.timeEnd('TermsModal-Init');
    this.modalController.dismiss();
  }
}