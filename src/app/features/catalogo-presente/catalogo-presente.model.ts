/// Item fictício do catálogo — o que os convidados veem
export interface CatalogoPresente {
  id: number;
  nome: string;
  descricao?: string;
  valor: number;
  imagemUrl?: string;
  criadoEm?: string;
}

// Form para criar/editar no admin
export interface CatalogoPresenteForm {
  nome: string;
  descricao?: string;
  valor: number;
  imagemUrl?: string;
}