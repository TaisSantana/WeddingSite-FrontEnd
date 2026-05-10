import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, switchMap, takeWhile, tap, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IniciarPagamentoRequest, IniciarPagamentoResponse, PagamentoCartaoRequest, PagamentoCartaoResponse, StatusPagamentoResponse } from './pagbank.model';


@Injectable({ providedIn: 'root' })
export class PagamentoService {
  private readonly api = `${environment.apiUrl}/pagamentos`;

  constructor(private http: HttpClient) {}

  // ─────────────────────────────────────────────────────────
  // PIX — chama o backend que cria a cobrança na PagBank API
  // Retorna QR Code base64 + copia e cola + txid
  // ─────────────────────────────────────────────────────────
  iniciarPix(req: IniciarPagamentoRequest): Observable<IniciarPagamentoResponse> {
    return this.http.post<IniciarPagamentoResponse>(`${this.api}/pix`, req);
  }

  // Consulta o status do Pix a cada `intervaloMs` milissegundos
  // Para automaticamente quando status = PAGO ou EXPIRADO
  consultarStatusPix(
    txid: string,
    intervaloMs = 5000
  ): Observable<StatusPagamentoResponse> {
    return interval(intervaloMs).pipe(
      switchMap(() =>
        this.http.get<StatusPagamentoResponse>(`${this.api}/pix/${txid}/status`)
      ),
      takeWhile(r => r.status === 'PENDENTE', /* inclusive= */ true)
    );
  }

  // ─────────────────────────────────────────────────────────
  // CARTÃO — usa tokenização PagBank.js no front antes de
  // enviar para o backend (nunca trafega o número real)
  // ─────────────────────────────────────────────────────────
  pagarCartao(req: PagamentoCartaoRequest): Observable<PagamentoCartaoResponse> {
    return this.http.post<PagamentoCartaoResponse>(`${this.api}/cartao`, req);
  }
}