import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet, IonHeader, IonToolbar, IonSpinner } from '@ionic/angular/standalone';
import { Platform } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, IonHeader, IonToolbar, IonSpinner, CommonModule],
})
export class AppComponent implements OnInit {
  isLoading = true;

  constructor(private platform: Platform, private authService: AuthService) {}

  ngOnInit() {
    this.platform.ready().then(() => {
      // Check token expiration on app start
      this.authService.checkAndRefreshAuth();

      // Simulate loading time or wait for any initialization
      setTimeout(() => {
        const loadingElement = document.querySelector('[style*="opacity: 1"]') as HTMLElement;
        if (loadingElement) {
          loadingElement.style.opacity = '0';
          setTimeout(() => {
            this.isLoading = false;
          }, 500); // Wait for fade out animation
        } else {
          this.isLoading = false;
        }
      }, 2000); // Adjust time as needed
    });
  }
}
