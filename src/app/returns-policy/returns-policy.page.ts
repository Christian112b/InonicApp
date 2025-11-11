import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonButton, IonIcon } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  selector: 'app-returns-policy',
  templateUrl: './returns-policy.page.html',
  styleUrls: ['./returns-policy.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonButton, IonIcon, CommonModule, FormsModule]
})
export class ReturnsPolicyPage implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  closePage() {
    this.router.navigate(['/tabs/tab5']);
  }

}
