import { Injectable } from '@angular/core';
import {HttpInterceptor} from '@angular/common/http';
import {AuthService} from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class TokenInterceptorService implements HttpInterceptor {
  private token
  constructor(
    private authService:AuthService
    ) {
      this.token = this.authService.getToken()
     }
  intercept(req,next)
{
  const tokenizeRequest = req.clone({
    setHeaders:{
      Authorization:`Bearer ${this.token}`
     
    }
  });
  return next.handle(tokenizeRequest);
}
  
}
