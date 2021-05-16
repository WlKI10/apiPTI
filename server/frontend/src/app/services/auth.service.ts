import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http'
import {Router} from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/internal/operators/map';
/*
export interface UserDetails {
  _id: string;
  email: string;
  name: string;
  exp: number;
  iat: number;
}

interface TokenResponse {
  token: string;
}

export interface TokenPayload {
  email: string;
  password: string;
  name?: string;
}*/
@Injectable({
  providedIn: 'root'
})

export class AuthService {
private URL = 'http://localhost:3000'
//private token:string;
  constructor(private http:HttpClient,private router: Router) { }
  /*private request(method: 'post'|'get', type: 'login'|'signup'|'private', user?: TokenPayload): Observable<any> {
    let base;
  
    if (method === 'post') {
      base = this.http.post(this.URL+'/${type}', user);
    } else {
      base = this.http.get(this.URL+'/${type}', { headers: { Authorization: `Bearer ${this.getToken()}` }});
    }
  
    const request = base.pipe(
      map((data: TokenResponse) => {
        if (data.token) {
          this.saveToken(data.token);
        }
        return data;
      })
    );
  
    return request;
  }
  private saveToken(token: string): void {
    localStorage.setItem('mean-token', token);
    this.token = token;
  }

  private getToken(): string {
    if (!this.token) {
      this.token = localStorage.getItem('mean-token');
    }
    return this.token;
  }

  public logout(): void {
    this.token = '';
    window.localStorage.removeItem('mean-token');
    this.router.navigateByUrl('/');
  }

  public getUserDetails(): UserDetails {
    const token = this.getToken();
    let payload;
    if (token) {
      payload = token.split('.')[1];
      payload = window.atob(payload);
      return JSON.parse(payload);
    } else {
      return null;
    }
  }

  public isLoggedIn(): boolean {
    const user = this.getUserDetails();
    if (user) {
      return user.exp > Date.now() / 1000;
    } else {
      return false;
    }
  }
  public register(user: TokenPayload): Observable<any> {
    return this.request('post', 'signup', user);
  }
  
  public login(user: TokenPayload): Observable<any> {
    return this.request('post', 'login', user);
  }
  
  public profile(): Observable<any> {
    return this.request('get', 'private');
  }*/
  signUp(user){
    //console.log(user.json())
   return this.http.post<any>(this.URL+'/signup',user);
   
  }
  signIn(user){
    //console.log(user.json())
    return this.http.post<any>(this.URL+'/login',user);
    
  }
  loggedIn(){
    return !!localStorage.getItem('token');
  }
  getToken(){
  
    return localStorage.getItem('token');
  }
  
 
  logOut(){
    localStorage.removeItem('token');
    this.router.navigate(['/']);
  }
}
