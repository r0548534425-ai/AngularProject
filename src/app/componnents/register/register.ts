import { Component, inject } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth/authService';
import { Router, RouterLink } from '@angular/router';
@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})


export class Register {
  registerService = inject(AuthService);
  private fb = inject(FormBuilder);
  router = inject(Router);
onSubmit() {
  console.log(this.registerForm.value);

  const data=this.registerForm.value as {
    name: string;
    email: string;
    password: string;
  }
  this.registerService.registerUser(data).subscribe({
    next:(res)=>{
      console.log('Registration successful', res); 
       this.registerForm.reset(); 
        this.router.navigate(['/dashboard']);
     
    },
    error:(err)=>{
      console.error('Registration failed', err);
       this.registerForm.reset();
    }
    
  }
    );
}


  registerForm = this.fb.group({
    name: ['',[Validators.required, Validators.minLength(3)]],
    email: ['',[Validators.required, Validators.email]],
    password: ['',[Validators.required, Validators.minLength(6)]],

  });

}

