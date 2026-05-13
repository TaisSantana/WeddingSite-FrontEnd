import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, of, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ConviteAdminRequest } from '../admin/admin.model';
import { ConviteResponse, RsvpRequest, StatusPresenca } from './convite.model';

@Injectable({ providedIn: 'root' })
export class ConviteService {
  private http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/convites`;

  buscar(codigo: string): Observable<ConviteResponse> {
    return this.http.get<ConviteResponse>(`${this.api}/${codigo.toUpperCase()}`);
  }

  confirmar(codigo: string, rsvps: RsvpRequest[]): Observable<void> {
     return this.http.post<void>(`${this.api}/${codigo.toUpperCase()}/confirmar`, rsvps);
  }

  criar(dto: ConviteAdminRequest): Observable<ConviteResponse> {
    return this.http.post<ConviteResponse>(this.api, dto);
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  
  listar(): Observable<ConviteResponse[]> {
    return this.http.get<ConviteResponse[]>(this.api);
  }

  statsSummary() {
  return this.listar().pipe(
    map((convites: ConviteResponse[]) => {

      const convidados = convites.flatMap(c => c.convidados);

      return {
        total: convidados.length,
        confirmados: convidados.filter(g => g.status === 'CONFIRMADO').length,
        pendentes: convidados.filter(g => g.status === 'PENDENTE').length,
        talvez: convidados.filter(g => g.status === 'TALVEZ').length,
        naoVem: convidados.filter(g => g.status === 'NAO_VEM').length,
      };
    })
  );
}





}