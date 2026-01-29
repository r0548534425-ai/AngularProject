import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth/authService';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  authService = inject(AuthService);
  isLogged = this.authService.isLogged;
  
  get currentUser() {
    const user = sessionStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
  
logout() {  
    this.authService.logout();
    
}
}
