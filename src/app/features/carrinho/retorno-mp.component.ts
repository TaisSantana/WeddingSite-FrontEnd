import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { PresenteRecebidoService } from '../presente-recebido/presente-recebido.service';
import { PaymentService } from '../payment/payment.service';
import { CatalogoPresenteService } from '../catalogo-presente/catalogo-presente.service';
import { CarrinhoService } from './carrinho.service';

type StatusRetorno = 'CARREGANDO' | 'APROVADO' | 'PENDENTE' | 'FALHA';

/**
 * Componente exibido quando o Mercado Pago redireciona de volta
 * após o checkout. Lê os query params que o MP envia na URL:
 *   ?collection_status=approved&payment_id=xxx&...
 */
@Component({
  selector: 'app-retorno-mp',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="retorno-wrapper">

      <!-- CARREGANDO -->
      <div class="retorno-card card" *ngIf="status === 'CARREGANDO'">
        <div class="retorno-card__spinner"></div>
        <p>Verificando pagamento...</p>
      </div>

      <!-- APROVADO -->
      <div class="retorno-card card retorno-card--sucesso" *ngIf="status === 'APROVADO'">
        <div class="retorno-card__icon">💜</div>
        <h2 class="retorno-card__title">Presente confirmado!</h2>
        <p class="retorno-card__sub">
          Seu pagamento foi aprovado pelo Mercado Pago.<br>
          Você receberá um email de confirmação em instantes. 🦋
        </p>
        <div class="retorno-card__badge">💳 Pago via Mercado Pago</div>
        <a routerLink="/inicio" class="btn btn--primary" style="margin-top:1.5rem">
          🏠 Voltar ao Início
        </a>
      </div>

      <!-- PENDENTE -->
      <div class="retorno-card card retorno-card--pendente" *ngIf="status === 'PENDENTE'">
        <div class="retorno-card__icon">⏳</div>
        <h2 class="retorno-card__title">Pagamento em análise</h2>
        <p class="retorno-card__sub">
          Seu pagamento está sendo processado pelo Mercado Pago.<br>
          Assim que confirmado, você receberá um email. 💌
        </p>
        <a routerLink="/inicio" class="btn btn--outline" style="margin-top:1.5rem">
          🏠 Voltar ao Início
        </a>
      </div>

      <!-- FALHA -->
      <div class="retorno-card card retorno-card--falha" *ngIf="status === 'FALHA'">
        <div class="retorno-card__icon">😔</div>
        <h2 class="retorno-card__title">Pagamento não aprovado</h2>
        <p class="retorno-card__sub">
          Algo deu errado no pagamento. Você pode tentar novamente
          escolhendo outra forma de pagamento.
        </p>
        <a routerLink="/carrinho" class="btn btn--primary" style="margin-top:1.5rem">
          🛒 Tentar novamente
        </a>
      </div>

    </div>
  `,
  styles: [`
    .retorno-wrapper {
      min-height: calc(100vh - var(--nav-h));
      margin-top: var(--nav-h);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1.5rem;
      background: linear-gradient(135deg, var(--serenity-pale), var(--lilac-pale));
    }

    .retorno-card {
      max-width: 480px;
      width: 100%;
      padding: 2.5rem;
      text-align: center;

      &__spinner {
        width: 48px; height: 48px;
        border: 4px solid var(--serenity-pale);
        border-top-color: var(--serenity-dark);
        border-radius: 50%;
        animation: spin 0.9s linear infinite;
        margin: 0 auto 1rem;
      }

      &__icon  { font-size: 3.5rem; display: block; margin-bottom: 1rem; }
      &__title {
        font-family: var(--font-serif);
        font-size: 1.8rem;
        font-style: italic;
        color: var(--text-dark);
        margin-bottom: 0.75rem;
      }
      &__sub   { font-size: 0.9rem; color: var(--text-mid); line-height: 1.7; }

      &__badge {
        display: inline-flex;
        margin-top: 1rem;
        background: var(--serenity-pale);
        color: var(--serenity-dark);
        padding: 0.35rem 1rem;
        border-radius: 20px;
        font-size: 0.82rem;
        font-weight: 500;
      }
    }

    @keyframes spin { to { transform: rotate(360deg); } }
  `],
})
export class RetornoMpComponent implements OnInit {
  status: StatusRetorno = 'CARREGANDO';

  constructor(
    private route:          ActivatedRoute,
    private cart:           CarrinhoService,
    private presenteSvc:    PresenteRecebidoService,
    private contribuicaoSvc: PaymentService,
  ) {}

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    const collectionStatus = params.get('collection_status');
    const externalRef      = params.get('external_reference');

    switch (collectionStatus) {
      case 'approved':
        // Limpa carrinho e marca presentes (o backend já fez via webhook,
        // mas garantimos aqui também para a UI ficar consistente)
        this.cart.clear();
        this.status = 'APROVADO';
        break;
      case 'pending':
      case 'in_process':
        this.status = 'PENDENTE';
        break;
      default:
        this.status = 'FALHA';
    }
  }
}