import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse } from '../models/auth/auth-response.interface';
import { LoginRequest } from '../models/auth/login-request.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly apiUrl: string;
  private tokenSubject = new BehaviorSubject<string | null>(
    localStorage.getItem('token')
  );
  public token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient) {
    this.apiUrl = environment.apiBaseUrl;
  }

  /**
   * Autentica un administrador y retorna JWT token
   *
   * Backend: POST /auth/login
   * @param email Email del administrador
   * @param password Contraseña del administrador
   * @returns Observable con token JWT si las credenciales son correctas
   */
  login(email: string, password: string): Observable<AuthResponse> {
    const body: LoginRequest = { email, password };
    return this.http
      .post<AuthResponse>(
        `${this.apiUrl}${environment.apiEndpoints.auth.login}`,
        body
      )
      .pipe(
        tap((response) => {
          if (response.ok && response.token) {
            localStorage.setItem('token', response.token);
            this.tokenSubject.next(response.token);
          }
        })
      );
  }

  /**
   * Establece el token JWT en localStorage y estado
   *
   * @param token JWT token a guardar
   */
  setToken(token: string): void {
    localStorage.setItem('token', token);
    this.tokenSubject.next(token);
  }

  /**
   * Cierra la sesión del administrador
   * Remueve el token de localStorage y limpia el estado
   */
  logout(): void {
    localStorage.removeItem('token');
    this.tokenSubject.next(null);
  }

  /**
   * Obtiene el token JWT actual
   *
   * @returns Token JWT o null si no existe
   */
  getToken(): string | null {
    // Read directly from localStorage to ensure we always get the latest value
    const token = localStorage.getItem('token');

    // Keep BehaviorSubject in sync if there's a mismatch
    if (token !== this.tokenSubject.value) {
      this.tokenSubject.next(token);
    }

    return token;
  }

  /**
   * Verifica si el usuario está autenticado
   *
   * @returns true si existe un token JWT válido
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }

  /**
   * Decodifica el JWT y obtiene información del administrador actual
   *
   * @returns Datos del admin (id, email, role) o null si no hay token
   */
  getCurrentUser(): { id: number; email: string } | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      // Decodificar payload del JWT (base64)
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));

      return {
        id: decoded.id,
        email: decoded.email,
      };
    } catch (error) {
      console.error('Error decodificando token JWT:', error);
      return null;
    }
  }
}
