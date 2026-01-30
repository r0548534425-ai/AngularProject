import { Component, inject, signal } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth/authService';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register',
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
  templateUrl: './register.html',
  styleUrl: './register.css',
})

export class Register {
  registerService = inject(AuthService);
  private fb = inject(FormBuilder);
  router = inject(Router);
  private snackBar = inject(MatSnackBar);
  
  isLoading = signal<boolean>(false);
  hidePassword = signal<boolean>(true);

  registerForm = this.fb.group({
    name: ['',[Validators.required, Validators.minLength(3)]],
    email: ['',[Validators.required, Validators.email]],
    password: ['',[Validators.required, Validators.minLength(6)]],
  });

  onSubmit() {
    if (this.registerForm.invalid) {
      this.snackBar.open('אנא מלא את כל השדות בצורה תקינה', 'סגור', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.isLoading.set(true);

    const data=this.registerForm.value as {
      name: string;
      email: string;
      password: string;
    }
    
    this.registerService.registerUser(data).subscribe({
      next:(res)=>{
        console.log('Registration successful', res); 
        this.isLoading.set(false);
        this.snackBar.open('נרשמת בהצלחה! מעביר אותך למערכת...', 'סגור', {
          duration: 2000,
          panelClass: ['success-snackbar']
        });
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 500);
      },
      error:(err)=>{
        console.error('Registration failed', err);
        this.isLoading.set(false);
        this.snackBar.open('שגיאה בהרשמה. אולי המשתמש כבר קיים?', 'סגור', {
          duration: 4000,
          panelClass: ['error-snackbar']
        });
        this.registerForm.reset();
      }
    });
  }
}

