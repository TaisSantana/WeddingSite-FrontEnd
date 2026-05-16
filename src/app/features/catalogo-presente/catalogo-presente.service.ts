import { Injectable, signal, computed, inject } from '@angular/core';
import { PresenteRecebidoDTO } from '../presente-recebido/presente-recebido.model';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { CatalogoPresente, CatalogoPresenteForm } from './catalogo-presente.model';

@Injectable({ providedIn: 'root' })
export class CatalogoPresenteService {
  private readonly api = `${environment.apiUrl}/catalogo`;
  private http = inject(HttpClient);

  formatCurrency(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
  listar(): Observable<CatalogoPresente[]> {
    return this.http.get<CatalogoPresente[]>(this.api);
  }

  criar(dto: CatalogoPresenteForm): Observable<CatalogoPresente> {
    return this.http.post<CatalogoPresente>(this.api, dto);
  }

  atualizar(id: number, dto: CatalogoPresenteForm): Observable<CatalogoPresente> {
    return this.http.patch<CatalogoPresente>(`${this.api}/${id}`, dto);
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}

