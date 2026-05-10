import { Gift } from "../gifts/gift.model";

// --- Presente ---
export type FormaPagamento = 'PIX' | 'CARTAO';

export interface PaymentRequest {
  nome: string;
  email: string
  mensagem?: string;
  formaPagamento: FormaPagamento;
  itens: { presenteId: number }[];
}

export interface PaymentResponse {
  id: number;
  nome: string;
  mensagem?: string;
  formaPagamento: FormaPagamento;
  total: number;
  criadoEm: string;
  itens: { presente: Gift; valorPago: number }[];
}


// --- Pagamento Mercado Pago ---
export interface ItemPagamentoDTO {
  presenteId: number;
}

// PIX
export interface IniciarPixRequestDTO {
  nome:  string;
  email: string;
  mensagem?:   string;
  itens:       ItemPagamentoDTO[];
}

export interface PixDataDTO {
  paymentId:    string;
  valor:        number;
  copiaECola:   string;
  qrCodeBase64: string;
  expiresAt:    string;
  status:       string;
}

export interface IniciarPixResponseDTO {
  contribuicaoId: number;
  pix: PixDataDTO;
}

export interface StatusPixDTO {
  paymentId: string;
  status:    'PENDENTE' | 'PAGO' | 'EXPIRADO';
  pagoEm?:   string;
}

// CARTÃO — Checkout Pro
export interface CheckoutProRequestDTO {
  nome:  string;
  email: string;
  mensagem?:   string;
  itens:       ItemPagamentoDTO[];
}

export interface CheckoutProResponseDTO {
  contribuicaoId: number;
  preferenceId:   string;
  checkoutUrl:    string;   // produção
  sandboxUrl:     string;   // testes
}