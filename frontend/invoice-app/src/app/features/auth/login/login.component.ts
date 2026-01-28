import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, PasswordModule, ButtonModule, CardModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  form: FormGroup = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  loading = signal(false);
  errorMessage = signal<string | null>(null);
  submitted = signal(false);

  get f() { return this.form.controls; }

  submit() {
    this.submitted.set(true);
    if (this.form.invalid) return;

    this.loading.set(true);
    this.errorMessage.set(null);

    const { username, password } = this.form.value;
    this.authService.login(username, password).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.token) {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.error || 'Credenciales inválidas');
      }
    });
  }
}
