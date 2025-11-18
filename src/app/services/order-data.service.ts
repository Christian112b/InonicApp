import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderDataService {

  private orderDataSubject = new BehaviorSubject<any>(null);
  public orderData$ = this.orderDataSubject.asObservable();

  constructor() {
    console.log('OrderDataService created');
  }

  setOrderData(order: any) {
    console.log('Setting order data:', order);
    this.orderDataSubject.next(order);
  }

  getOrderData() {
    const data = this.orderDataSubject.value;
    console.log('Getting order data:', data);
    // Don't clear immediately, let the component handle it
    return data;
  }

  clearOrderData() {
    console.log('Clearing order data');
    this.orderDataSubject.next(null);
  }
}