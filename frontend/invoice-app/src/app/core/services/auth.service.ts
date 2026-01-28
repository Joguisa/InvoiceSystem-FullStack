import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { AuthResponse } from '../models/auth/auth-response.interface';
import { LoginRequest } from '../models/auth/login-request.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly apiUrl: string;
  private tokenSubject = new BehaviorSubject<string | null>(null);
  public readonly token$ = this.tokenSubject.asObservable();

  public readonly isAuthenticated$ = this.token$.pipe(
    map(token => {
      if (!token) return false;
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return !payload.exp || payload.exp * 1000 > Date.now();
      } catch {
        return false;
      }
    })
  );

  constructor(private http: HttpClient) {
    this.apiUrl = environment.apiBaseUrl;
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      this.tokenSubject.next(storedToken);
    }
  }

  /**
   * Autentica y retorna token
   * @param email
   * @param password
   * @returns
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
            this.setToken(response.token);
          }
        })
      );
  }

  /**
   * Guarda el token en localStorage
   * @param token
   */
  setToken(token: string): void {
    localStorage.setItem('token', token);
    this.tokenSubject.next(token);
  }

  /**
   * Remueve el token de localStorage y limpia el estado
   */
  logout(): void {
    localStorage.removeItem('token');
    this.tokenSubject.next(null);
  }

  /**
   * Obtiene el token actual del estado
   * @returns
   */
  getToken(): string | null {
    return this.tokenSubject.value;
  }

  /**
   * Valida el token y obtiene administrador actual
   * @returns
   */
  getCurrentUser(): { id: number; email: string } | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));

      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        this.logout();
        return null;
      }

      return {
        id: decoded.id,
        email: decoded.email,
      };
    } catch (error) {
      this.logout();
      return null;
    }
  }
}
