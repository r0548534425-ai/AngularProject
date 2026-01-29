import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { login, register } from '../../models/auth.model';
import { AuthService } from '../../services/auth/authService';
import { email } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';



@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  loginForm = this.fb.group({
    email: ['',[Validators.required, Validators.email]],
    password: ['',[Validators.required, Validators.minLength(6)]],
  });
   onSubmit() {
  const data=this.loginForm.value as {
    email: string;
    password: string;
  }
  this.authService.loginUser(data).subscribe({
    next:(res)=>{
      console.log('Login successful', res);
      this.router.navigate(['/dashboard']);
    },
    error:(err)=>{
      console.error('Login failed', err);
    }
  }

    );
  }
}  
