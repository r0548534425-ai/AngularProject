import { Component, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth/authService';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, MatDividerModule],
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
