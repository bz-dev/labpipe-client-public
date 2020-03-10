import { Injectable } from '@angular/core';
import {CanActivate, Router} from '@angular/router';
import {ShareDataService} from './share-data.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {
  operator: any;

  constructor(public tds: ShareDataService, public router: Router) {
    this.tds.operator.subscribe(value => this.operator = value);
  }

  canActivate(): boolean {
    if (!this.operator) {
      this.router.navigate(['user-login']);
      return false;
    }
    return true;
  }
}
