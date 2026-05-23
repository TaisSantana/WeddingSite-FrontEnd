import { CatalogoPresente } from "../catalogo-presente/catalogo-presente.model";

// --- Presente ---
export type FormaPagamento = 'PIX' | 'CARTAO';

export interface PaymentRequest {
  nome: string;
  email: string;
  mensagem?: string;
  formaPagamento: FormaPagamento;
  itens: { catalogoId: number }[];
}

export interface PaymentResponse {
  id: number;
  nome: string;
  mensagem?: string;
  formaPagamento: FormaPagamento;
  total: number;
  criadoEm: string;
  itens: { presente: CatalogoPresente; valorPago: number }[];
}

// --- Pagamento Mercado Pago ---
export interface ItemPagamentoDTO {
  catalogoId: number;
}

// PIX
export interface IniciarPixRequestDTO {
  nome:     string;
  email:    string;
  mensagem?: string;
  itens:    ItemPagamentoDTO[];
}

export interface PixDataDTO {
  presenteRecebidoId: number;
  mpPaymentId:        string;
  valor:              number;
  copiaECola:         string;
  qrCodeBase64:       string;
  expiresAt:          string;
  status:             string;
}

// ← sem wrapper, a resposta do backend É o PixDataDTO direto
export type IniciarPixResponseDTO = PixDataDTO;

export interface StatusPixDTO {
  paymentId: string;
  status:    'PENDENTE' | 'PAGO' | 'EXPIRADO';
  pagoEm?:   string;
}

// CARTÃO — Checkout Pro
export interface CheckoutProRequestDTO {
  nome:     string;
  email:    string;
  mensagem?: string;
  itens:    ItemPagamentoDTO[];
}

export interface CheckoutProResponseDTO {
  contribuicaoId: number;
  preferenceId:   string;
  checkoutUrl:    string;
  sandboxUrl:     string;
}