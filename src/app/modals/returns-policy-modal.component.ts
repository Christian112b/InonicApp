import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close, refreshOutline } from 'ionicons/icons';

@Component({
  selector: 'app-returns-policy-modal',
  templateUrl: './returns-policy-modal.component.html',
  styleUrls: ['./returns-policy-modal.component.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, CommonModule, FormsModule]
})
export class ReturnsPolicyModalComponent {
  @Input() content: string = '';

  constructor(private modalController: ModalController) {
    console.time('ReturnsModal-Init');
    addIcons({ close, refreshOutline });
  }

  dismiss() {
    console.timeEnd('ReturnsModal-Init');
    this.modalController.dismiss();
  }
}