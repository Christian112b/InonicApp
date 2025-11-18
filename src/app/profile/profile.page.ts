import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonItem, IonLabel, IonInput, IonSpinner } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

interface UserProfile {
  name: string;
  apellido: string;
  email: string;
  phone: string;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonItem, IonLabel, IonInput, IonSpinner, CommonModule, FormsModule]
})
export class ProfilePage implements OnInit {

  userProfile: UserProfile = {
    name: '',
    apellido: '',
    email: '',
    phone: ''
  };

  originalProfile: UserProfile = { ...this.userProfile };
  isSaving: boolean = false;

  constructor(
    private router: Router,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.loadUserProfile();
  }

  loadUserProfile() {
    // Load from localStorage
    const userData = localStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData);
      this.userProfile = {
        name: user.name || '',
        apellido: user.apellido || '',
        email: user.email || '',
        phone: user.phone || ''
      };
      this.originalProfile = { ...this.userProfile };
    }
  }

  saveProfile() {
    // Validate required fields
    if (!this.userProfile.name?.trim() || !this.userProfile.email?.trim()) {
      this.showToast('Nombre y correo electrónico son obligatorios', 'warning');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.userProfile.email)) {
      this.showToast('Formato de correo electrónico inválido', 'warning');
      return;
    }

    this.isSaving = true;

    // Save to localStorage
    const updatedUserData = {
      ...JSON.parse(localStorage.getItem('userData') || '{}'),
      name: this.userProfile.name.trim(),
      apellido: this.userProfile.apellido?.trim() || '',
      email: this.userProfile.email.trim(),
      phone: this.userProfile.phone?.trim() || ''
    };

    localStorage.setItem('userData', JSON.stringify(updatedUserData));
    this.originalProfile = { ...this.userProfile };

    // Simulate API call delay
    setTimeout(() => {
      this.isSaving = false;
      this.showToast('Perfil actualizado correctamente', 'success');
    }, 1000);

    // TODO: Send to backend API when available
  }

  resetProfile() {
    this.userProfile = { ...this.originalProfile };
    this.showToast('Cambios descartados', 'info');
  }

  closePage() {
    // Check if there are unsaved changes
    const hasChanges = JSON.stringify(this.userProfile) !== JSON.stringify(this.originalProfile);
    if (hasChanges) {
      // In a real app, you might want to show a confirmation dialog
      // For now, we'll just navigate back
    }
    this.router.navigate(['/tabs/cuenta']);
  }

  private async showToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'top',
      cssClass: `toast-${type}`
    });
    await toast.present();
  }
}