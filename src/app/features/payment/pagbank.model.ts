export interface PagamentoPix {
  txid: string;
  valor: number;
  qrCodeBase64: string;   // imagem PNG em base64
  copiaECola: string;     // código "PIX copia e cola"
  expiresAt: string;      // ISO datetime
  status: 'PENDENTE' | 'PAGO' | 'EXPIRADO';
}

export interface PagamentoCartaoRequest {
  nomeDoador:   string;
  emailDoador:  string;
  mensagem?:    string;
  itens:        { presenteId: number }[];
  cartao: {
    numero:     string;   // tokenizado pelo PagBank.js — NUNCA trafega o número real
    nomeTitular: string;
    validade:   string;   // MM/AA
    cvv:        string;
    parcelas:   number;
  };
}

export interface PagamentoCartaoResponse {
  id:        string;
  status:    'AUTORIZADO' | 'RECUSADO' | 'AGUARDANDO';
  mensagem:  string;
  redirectUrl?: string;   // URL de 3DS se necessário
}

export interface IniciarPagamentoRequest {
  nomeDoador:  string;
  emailDoador: string;
  mensagem?:   string;
  itens:       { presenteId: number }[];
}

export interface IniciarPagamentoResponse {
  contribuicaoId: number;
  pix: PagamentoPix;
}

export interface StatusPagamentoResponse {
  txid:    string;
  status:  'PENDENTE' | 'PAGO' | 'EXPIRADO';
  pago_em?: string;
}