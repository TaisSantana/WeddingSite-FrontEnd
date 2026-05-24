import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, of, switchMap, takeWhile } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CheckoutProRequestDTO, CheckoutProResponseDTO, IniciarPixRequestDTO, IniciarPixResponseDTO, StatusPixDTO, PaymentRequest, PaymentResponse } from './payment.model';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly api = `${environment.apiUrl}/pagamentos`;

  constructor(private http: HttpClient) {}

  // ── PIX ──────────────────────────────────────────────
  iniciarPix(req: IniciarPixRequestDTO): Observable<IniciarPixResponseDTO> {
    return this.http.post<IniciarPixResponseDTO>(`${this.api}/pix`, req);
  }

  // Consulta status a cada intervaloMs ms; para quando status != PENDENTE
  consultarStatusPix(
    paymentId: string,
    intervaloMs = 5000
  ): Observable<StatusPixDTO> {
    return interval(intervaloMs).pipe(
      switchMap(() =>
        this.http.get<StatusPixDTO>(`${this.api}/pix/${paymentId}/status`)
      ),
      takeWhile(r => r.status === 'PENDENTE', true)
    );
  }

  // ── CHECKOUT PRO (cartão) ─────────────────────────────
  // Retorna a URL do ambiente seguro do Mercado Pago
  criarCheckoutPro(req: CheckoutProRequestDTO): Observable<CheckoutProResponseDTO> {
    return this.http.post<CheckoutProResponseDTO>(`${this.api}/checkout`, req);
  }

  private useMock = true;
  private _mockData = signal<PaymentResponse[]>([]);
  readonly mockContribuicoes = this._mockData.asReadonly();

  registrar(dto: PaymentRequest): Observable<void> {
    if (this.useMock) {
      const mock: PaymentResponse = {
        id: Date.now(),
        nome: dto.nome,
        mensagem: dto.mensagem,
        formaPagamento: dto.formaPagamento,
        total: 0, // calculated by service in real app
        criadoEm: new Date().toISOString(),
        itens: [],
      };
      this._mockData.update(d => [...d, mock]);
      return of(void 0);
    }
    return this.http.post<void>(this.api, dto);
  }

  listar(): Observable<PaymentResponse[]> {
    if (this.useMock) return of(this._mockData());
    return this.http.get<PaymentResponse[]>(this.api);
  }

  totalArrecadado(): number {
    return this._mockData().reduce((s, c) => s + c.total, 0);
  }

}

export { PaymentRequest };
