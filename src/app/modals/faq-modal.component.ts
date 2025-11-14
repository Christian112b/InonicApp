import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close, helpCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-faq-modal',
  templateUrl: './faq-modal.component.html',
  styleUrls: ['./faq-modal.component.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, CommonModule, FormsModule],
  providers: [ModalController]
})
export class FaqModalComponent {
  @Input() content: string = '';

  constructor(private modalController: ModalController) {
    addIcons({ close, helpCircleOutline });
  }

  dismiss() {
    this.modalController.dismiss();
  }
}