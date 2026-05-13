// Pagamento feito por um convidado
export interface PresenteRecebidoDTO {
  id: number;
  nome: string;
  email: string;
  mensagem?: string;
  formaPagamento: string;
  total: number;
  statusPagamento: string;
  criadoEm: string;
  pagoEm?: string;
  itens: ItemPresenteRecebidoDTO[];
}

export interface ItemPresenteRecebidoDTO {
  catalogoId: number;
  nomePresente: string;
  valorPago: number;
  imagemUrl?: string;

}