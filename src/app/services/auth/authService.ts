import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { register, login, authResponse } from '../../models/auth.model';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient); 
  private router = inject(Router);
  private apiUrl = 'https://angulaerserver.onrender.com/api';
  isLogged = signal<boolean>(!!sessionStorage.getItem('token'));
  
  currentUser = signal<any | null>(
    sessionStorage.getItem('user') ? JSON.parse(sessionStorage.getItem('user')!) : null
  );

  registerUser(data: register) {
    return this.http.post<authResponse>(`${this.apiUrl}/register`, data).pipe(
      tap((res) => {this.handleAuth(res);
        this.isLogged.set(true);
      }
    )
    );
  }

  loginUser(data: login) {
    return this.http.post<authResponse>(`${this.apiUrl}/login`, data).pipe(
      tap((res) => {this.handleAuth(res);
        this.isLogged.set(true);
      })
    );
  }
  getUsers() {
    return this.http.get<any[]>(`https://angulaerserver.onrender.com/users`,{
        headers:{ Authorization: `Bearer ${sessionStorage.getItem('token')}` }
    });
  }

  private handleAuth(res: authResponse) {
   
    sessionStorage.setItem('token', res.token);
    sessionStorage.setItem('user', JSON.stringify(res.user));
    
    this.currentUser.set(res.user);
  }

  logout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    this.currentUser.set(null);
    this.isLogged.set(false);
     this.router.navigate(['/login'])
  }
  isLoggedIn() {
    return !!sessionStorage.getItem('token');
  }
  
}