import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonInput, IonTextarea, IonLabel, IonItem } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.page.html',
  styleUrls: ['./contact.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonInput, IonTextarea, IonLabel, IonItem, CommonModule, FormsModule]
})
export class ContactPage implements OnInit {

  contactForm = {
    name: '',
    email: '',
    message: ''
  };

  constructor(private router: Router, private toastController: ToastController) { }

  ngOnInit() {
  }

  closePage() {
    this.router.navigate(['/tabs/mas']);
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

    // Here you would send the form data to your backend

    const toast = await this.toastController.create({
      message: 'Mensaje enviado correctamente',
      duration: 2000,
      position: 'bottom',
      cssClass: 'toast-success'
    });
    await toast.present();

    this.closePage();
  }

}
