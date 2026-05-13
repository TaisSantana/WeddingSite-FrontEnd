import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AdminLoginRequest, AdminLoginResponse } from './admin.model';

const TOKEN_KEY = 'wedding_admin_token';
// Demo credentials — in production use bcrypt in the backend
const DEMO_USER = 'noivos';
const DEMO_PASS = 'taisgabriel2026';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private useMock = true;

  private _loggedIn = signal<boolean>(this.hasValidToken());
  readonly isLoggedIn = this._loggedIn.asReadonly();

  login(req: AdminLoginRequest): Observable<AdminLoginResponse> {
    if (this.useMock) {
      if (req.username === DEMO_USER && req.password === DEMO_PASS) {
        const res: AdminLoginResponse = { token: 'mock-jwt-token', expiresIn: 86400 };
        localStorage.setItem(TOKEN_KEY, res.token);
        this._loggedIn.set(true);
        return of(res);
      }
      return throwError(() => new Error('Credenciais inválidas'));
    }
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
    return localStorage.getItem(TOKEN_KEY);
  }

  private hasValidToken(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  }
}