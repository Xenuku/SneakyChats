import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private loggedIn = new Subject<any>();
  constructor() { }
  // Update on user login so that the nav bar updates properly
  onUserLogin(data: any) {
    this.loggedIn.next(data);
  }
  
  getObservable(): Subject<any> {
    return this.loggedIn;
  }
  
}
