import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable, map, catchError, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import {Location} from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService,
    private location: Location
  ) { }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    return this.authService.getUserLoggedInData()
      .pipe(
        map(res => {
          if (res.data) {
            this.router.navigate(["messages", res.data.id])
            return false;
          }
          return true;
        }),
        catchError(() => {
          return of(true);
        })
      );
  }

}
