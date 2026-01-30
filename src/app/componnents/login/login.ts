import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { login, register } from '../../models/auth.model';
import { AuthService } from '../../services/auth/authService';
import { email } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule, 
    RouterLink, 
    MatCardModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule, 
    MatIconModule, 
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  
  isLoading = signal<boolean>(false);
  hidePassword = signal<boolean>(true);
  
  loginForm = this.fb.group({
    email: ['',[Validators.required, Validators.email]],
    password: ['',[Validators.required, Validators.minLength(6)]],
  });
  
  onSubmit() {
    if (this.loginForm.invalid) {
      this.snackBar.open('אנא מלא את כל השדות בצורה תקינה', 'סגור', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
      return;
    }
    
    this.isLoading.set(true);
    
    const data=this.loginForm.value as {
      email: string;
      password: string;
    }
    
    this.authService.loginUser(data).subscribe({
      next:(res)=>{
        console.log('Login successful', res);
        this.isLoading.set(false);
        this.snackBar.open('התחברת בהצלחה! 🎉', 'סגור', {
          duration: 2000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 500);
      },
      error:(err)=>{
        console.error('Login failed', err);
        this.isLoading.set(false);
        this.snackBar.open('שגיאה בהתחברות. אנא בדוק את הפרטים ונסה שוב', 'סגור', {
          duration: 4000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      }
    });
  }
}  
