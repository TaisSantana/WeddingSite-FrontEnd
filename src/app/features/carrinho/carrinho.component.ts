import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule }   from '@angular/common';
import { RouterLink }     from '@angular/router';
import { FormsModule }    from '@angular/forms';
import { Subscription }   from 'rxjs';

import { BrlPipe }             from '../../shared/pipes/brl.pipe';
import { ToastService } from 'src/app/shared/components/toast/toast.service';
import { CarrinhoService } from './carrinho.service';
import { PresenteRecebidoService } from '../presente-recebido/presente-recebido.service';
import { PaymentResponse, PaymentRequest, PixDataDTO, StatusPixDTO} from '../payment/payment.model';
import { PaymentService } from '../payment/payment.service';


type Etapa =
  | 'FORMULARIO'
  | 'PIX_AGUARDANDO'
  | 'CARTAO_PROCESSANDO'
  | 'SUCESSO';

type FormaPagamento = 'PIX' | 'CARTAO';

@Component({
  selector: 'app-carrinho',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, BrlPipe],
  templateUrl: './carrinho.component.html',
  styleUrls: ['./carrinho.component.scss'],
})
export class CatalogoPresenteComponent implements OnInit, OnDestroy {

  constructor(
    public  cart:            CarrinhoService,
    private contribuicaoSvc: PaymentService,
    private presenteSvc:     PresenteRecebidoService,
    private toastSvc:        ToastService,
    private pagamentoSvc:    PaymentService,
  ) {}

  // ── Formulário ────────────────────────────
  nome      = '';
  email     = '';
  mensagem  = '';
  pagamento: FormaPagamento = 'PIX';

  // ── Fluxo ─────────────────────────────────
  etapa: Etapa = 'FORMULARIO';
  erros: Record<string, string> = {};

  // ── Pix ───────────────────────────────────
  pixData: PixDataDTO | null = null;
  pixCopiado  = false;
  pixTicker   = 0;
  private pixSub?:     Subscription;
  private tickerInt?:  ReturnType<typeof setInterval>;

  // ── Checkout cartão ───────────────────────
  // true = sandbox (testes), false = produção
  private useSandbox = true;

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.pixSub?.unsubscribe();
    if (this.tickerInt) clearInterval(this.tickerInt);
  }

  // ─────────────────────────────────────────
  // UI helpers
  // ─────────────────────────────────────────
  setPagamento(p: FormaPagamento): void {
    this.pagamento = p;
    this.erros = {};
  }

  remove(id: number): void { this.cart.remove(id); }

  copiarPix(): void {
    if (!this.pixData) return;
    navigator.clipboard.writeText(this.pixData.copiaECola).then(() => {
      this.pixCopiado = true;
      setTimeout(() => (this.pixCopiado = false), 3000);
    });
  }

  get pixTempoFormatado(): string {
    const m = Math.floor(this.pixTicker / 60);
    const s = this.pixTicker % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  // ─────────────────────────────────────────
  // Validação
  // ─────────────────────────────────────────
  private validar(): boolean {
    this.erros = {};
    if (!this.nome.trim())
      this.erros['nome'] = 'Informe seu nome.';
    if (!this.email.trim())
      this.erros['email'] = 'Informe seu email.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email))
      this.erros['email'] = 'Email inválido.';
    return Object.keys(this.erros).length === 0;
  }

  // ─────────────────────────────────────────
  // Prosseguir
  // ─────────────────────────────────────────
  prosseguir(): void {
    if (!this.validar()) return;
    if (this.pagamento === 'PIX') {
      this.iniciarPix();
    } else {
      this.iniciarCheckoutPro();
    }
  }

  // ─────────────────────────────────────────
  // PIX
  // ─────────────────────────────────────────
  private iniciarPix(): void {
    this.etapa = 'CARTAO_PROCESSANDO'; // reutiliza a tela de loading

    this.pagamentoSvc.iniciarPix({
      nome:  this.nome.trim(),
      email: this.email.trim(),
      mensagem:    this.mensagem.trim() || undefined,
      itens:       this.cart.items().map(i => ({ catalogoId: i.presente.id })),
    }).subscribe({
      next: (res) => {
        this.pixData = res;                        // res já É o PixDataDTO
        this.etapa   = 'PIX_AGUARDANDO';
        this.iniciarTickerPix();
        this.iniciarPollingPix(res.mpPaymentId);   // era res.pix.paymentId
      },
      error: () => {
        this.etapa = 'FORMULARIO';
        this.toastSvc.error('Erro ao gerar o Pix. Tente novamente.');
      },
    });
  }

  private iniciarTickerPix(): void {
    // 30 minutos = 1800s
    this.pixTicker = 1800;
    this.tickerInt = setInterval(() => {
      this.pixTicker = Math.max(0, this.pixTicker - 1);
      if (this.pixTicker === 0) {
        clearInterval(this.tickerInt);
        if (this.etapa === 'PIX_AGUARDANDO') {
          this.etapa = 'FORMULARIO';
          this.pixData = null;
          this.toastSvc.error('O Pix expirou. Gere um novo código.');
        }
      }
    }, 1000);
  }

  private iniciarPollingPix(paymentId: string): void {
    this.pixSub = this.pagamentoSvc
      .consultarStatusPix(paymentId, 5000)
      .subscribe({
        next: (res: StatusPixDTO) => {
          if (res.status === 'PAGO') {
            this.pixSub?.unsubscribe();
            clearInterval(this.tickerInt);
            this.onPagamentoConfirmado('PIX');
          } else if (res.status === 'EXPIRADO') {
            this.pixSub?.unsubscribe();
            this.etapa   = 'FORMULARIO';
            this.pixData = null;
            this.toastSvc.error('O Pix expirou. Gere um novo código.');
          }
        },
        error: () => { /* ignora falhas pontuais no polling */ },
      });
  }

  // ─────────────────────────────────────────
  // CARTÃO — Checkout Pro Mercado Pago
  // ─────────────────────────────────────────
  private iniciarCheckoutPro(): void {
    this.etapa = 'CARTAO_PROCESSANDO';

    this.pagamentoSvc.criarCheckoutPro({
      nome:  this.nome.trim(),
      email: this.email.trim(),
      mensagem:    this.mensagem.trim() || undefined,
      itens:       this.cart.items().map(i => ({ catalogoId: i.presente.id })),
    }).subscribe({
      next: (res) => {
        // Redireciona para o ambiente seguro do Mercado Pago
        const url = this.useSandbox ? res.sandboxUrl : res.checkoutUrl;
        window.location.href = url;
      },
      error: () => {
        this.etapa = 'FORMULARIO';
        this.toastSvc.error('Erro ao criar checkout. Tente novamente.');
      },
    });
  }

  // ─────────────────────────────────────────
  // Conclusão (Pix confirmado pelo polling)
  // ─────────────────────────────────────────
  private onPagamentoConfirmado(forma: string): void {
    
    this.contribuicaoSvc.registrar({
      nome:     this.nome.trim(),
      email:    this.email.trim(),
      mensagem:       this.mensagem.trim() || undefined,
      formaPagamento: forma as any,
      itens:          this.cart.items().map(i => ({ catalogoId: i.presente.id })),
    }).subscribe();
    this.cart.clear();
    this.etapa = 'SUCESSO';
  }

  voltarParaFormulario(): void {
    this.pixSub?.unsubscribe();
    clearInterval(this.tickerInt);
    this.etapa   = 'FORMULARIO';
    this.pixData = null;
  }
}