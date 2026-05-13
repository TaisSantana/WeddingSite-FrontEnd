import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PresenteRecebidoDTO } from './presente-recebido.model';

@Injectable({ providedIn: 'root' })
export class PresenteRecebidoService {

  private readonly api = `${environment.apiUrl}/admin/presentes-recebidos`;

  constructor(private http: HttpClient) {}

  // Lista todos — admin vê tudo
  listar(): Observable<PresenteRecebidoDTO[]> {
    return this.http.get<PresenteRecebidoDTO[]>(this.api);
  }

  // Lista só os confirmados/pagos
  listarPagos(): Observable<PresenteRecebidoDTO[]> {
    return this.http.get<PresenteRecebidoDTO[]>(`${this.api}/pagos`);
  }

  formatCurrency(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}