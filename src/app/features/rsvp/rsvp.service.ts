import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, of, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ConviteAdminRequest } from '../auth/admin.model';
import { RsvpResponse, RsvpRequest, StatusPresenca } from './rsvp.model';

@Injectable({ providedIn: 'root' })
export class rsvpService {
  private http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/convites`;

  buscar(codigo: string): Observable<RsvpResponse> {
    return this.http.get<RsvpResponse>(`${this.api}/${codigo.toUpperCase()}`);
  }

  confirmar(codigo: string, rsvps: RsvpRequest[]): Observable<void> {
     return this.http.post<void>(`${this.api}/${codigo.toUpperCase()}/confirmar`, rsvps);
  }

  criar(dto: ConviteAdminRequest): Observable<RsvpResponse> {
    return this.http.post<RsvpResponse>(this.api, dto);
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  
  listar(): Observable<RsvpResponse[]> {
    return this.http.get<RsvpResponse[]>(this.api);
  }

  statsSummary() {
    return this.listar().pipe(
      map((convidados: RsvpResponse[]) => ({
        total: convidados.length,
        confirmados: convidados.filter(g => g.status === 'CONFIRMADO').length,
        pendentes: convidados.filter(g => g.status === 'PENDENTE').length,
        talvez: convidados.filter(g => g.status === 'TALVEZ').length,
        naoVem: convidados.filter(g => g.status === 'NAO_VEM').length,
      }))
    );
  }





}