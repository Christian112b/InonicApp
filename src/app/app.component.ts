import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet, IonHeader, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, IonHeader, IonToolbar],
})
export class AppComponent {
  constructor() {}
}
