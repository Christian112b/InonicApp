import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonSpinner, IonItem, IonLabel, IonToggle } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonSpinner, IonItem, IonLabel, IonToggle, CommonModule, FormsModule]
})
export class NotificationsPage implements OnInit {

  notificationSettings: any = {
    orderUpdates: true,
    promotions: false,
    newProducts: true,
    deliveryAlerts: true
  };

  constructor(private router: Router, private toastController: ToastController) { }

  ngOnInit() {
    // Load notification settings from localStorage or API
    this.loadNotificationSettings();
  }

  loadNotificationSettings() {
    const saved = localStorage.getItem('notificationSettings');
    if (saved) {
      this.notificationSettings = { ...this.notificationSettings, ...JSON.parse(saved) };
    }
  }

  saveNotificationSettings() {
    localStorage.setItem('notificationSettings', JSON.stringify(this.notificationSettings));
    // TODO: Send to API
  }

  onSettingChange() {
    // Auto-save when any toggle changes
    this.saveNotificationSettings();
    this.showToast('Preferencias guardadas', 'success');
  }

  closePage() {
    this.saveNotificationSettings();
    this.router.navigate(['/tabs/cuenta']);
  }

  private async showToast(message: string, type: 'success' | 'error' | 'warning' = 'success') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'top',
      cssClass: `toast-${type}`
    });
    await toast.present();
  }
}