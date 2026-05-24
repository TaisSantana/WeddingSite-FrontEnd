import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AdminLoginRequest, AdminLoginResponse } from './admin.model';

const TOKEN_KEY = 'wedding_admin_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http   = inject(HttpClient);
  private router = inject(Router);
  private useMock = false;

  private _loggedIn = signal<boolean>(this.hasValidToken());
  readonly isLoggedIn = this._loggedIn.asReadonly();

  login(req: AdminLoginRequest): Observable<AdminLoginResponse> {
    return this.http.post<AdminLoginResponse>(`${environment.apiUrl}/admin/login`, req).pipe(
      tap(res => {
        localStorage.setItem(TOKEN_KEY, res.token);
        this._loggedIn.set(true);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this._loggedIn.set(false);
    this.router.navigate(['/admin']);
  }

  getToken(): string | null {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    // valida expiração antes de retornar
    if (!this.isTokenValid(token)) {
      localStorage.removeItem(TOKEN_KEY);
      this._loggedIn.set(false);
      return null;
    }
    return token;
  }

  private hasValidToken(): boolean {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return false;
    return this.isTokenValid(token);
  }

  private isTokenValid(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expMs   = payload.exp * 1000;
      if (Date.now() >= expMs) {
        localStorage.removeItem(TOKEN_KEY);
        return false;
      }
      return true;
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      return false;
    }
  }
}