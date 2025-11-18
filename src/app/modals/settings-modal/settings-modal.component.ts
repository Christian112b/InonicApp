import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonItem, IonLabel, IonSelect, IonSelectOption, IonRange, IonToggle, IonText, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';

interface UserPreferences {
  favoriteCategories: string[];
  priceRange: { lower: number; upper: number };
  enableRecommendations: boolean;
  enableNotifications: boolean;
  preferredProducts: string[];
}

@Component({
  selector: 'app-settings-modal',
  templateUrl: './settings-modal.component.html',
  styleUrls: ['./settings-modal.component.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonItem, IonLabel, IonSelect, IonSelectOption, IonRange, IonToggle, IonText, IonCard, IonCardHeader, IonCardTitle, IonCardContent, CommonModule, FormsModule]
})
export class SettingsModalComponent implements OnInit {

  isOpen = false;
  preferences: UserPreferences = {
    favoriteCategories: [],
    priceRange: { lower: 10, upper: 500 },
    enableRecommendations: true,
    enableNotifications: true,
    preferredProducts: []
  };

  availableCategories = [
    'Tornillos',
    'Princesas',
    'Duquesas',
    'Esponjas',
    'Figuras',
    'Menta'
  ];

  constructor(private toastController: ToastController) { }

  ngOnInit() {
    this.loadUserPreferences();
  }

  open() {
    this.isOpen = true;
  }

  close() {
    this.isOpen = false;
  }

  private loadUserPreferences() {
    // Load preferences from localStorage
    const saved = localStorage.getItem('userPreferences');
    if (saved) {
      try {
        this.preferences = { ...this.preferences, ...JSON.parse(saved) };
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    }
  }

  savePreferences() {
    // Save preferences to localStorage
    localStorage.setItem('userPreferences', JSON.stringify(this.preferences));

    // Emit event to notify other components
    const event = new CustomEvent('preferencesUpdated', { detail: this.preferences });
    window.dispatchEvent(event);

    this.showToast('Preferencias guardadas exitosamente', 'success');
    this.close();
  }

  resetPreferences() {
    this.preferences = {
      favoriteCategories: [],
      priceRange: { lower: 10, upper: 500 },
      enableRecommendations: true,
      enableNotifications: true,
      preferredProducts: []
    };
  }

  private async showToast(message: string, type: 'success' | 'error' | 'warning' = 'success') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'top',
      cssClass: `toast-${type}`
    });
    await toast.present();
  }

  getPriceRangeText(): string {
    return `$${this.preferences.priceRange.lower} - $${this.preferences.priceRange.upper}`;
  }
}