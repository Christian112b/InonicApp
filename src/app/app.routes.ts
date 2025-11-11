import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'tab4',
    loadComponent: () => import('./tab4/tab4.page').then( m => m.Tab4Page)
  },  {
    path: 'tab5',
    loadComponent: () => import('./tab5/tab5.page').then( m => m.Tab5Page)
  },
  {
    path: 'privacy-policy',
    loadComponent: () => import('./privacy-policy/privacy-policy.page').then( m => m.PrivacyPolicyPage)
  },
  {
    path: 'returns-policy',
    loadComponent: () => import('./returns-policy/returns-policy.page').then( m => m.ReturnsPolicyPage)
  },
  {
    path: 'terms-of-service',
    loadComponent: () => import('./terms-of-service/terms-of-service.page').then( m => m.TermsOfServicePage)
  },

];
