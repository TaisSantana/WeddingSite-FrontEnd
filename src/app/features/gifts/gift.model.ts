// --- Presentes ---
export type StatusPresente = 'DISPONIVEL' | 'RESERVADO';

export interface Gift {
  id: number;
  nome: string;
  email?: string;
  descricao: string;
  valor: number;
  imagemUrl?: string;
  criadoEm?: string;
}

export interface GiftForm {
  nome: string;
  descricao: string;
  valor: number;
  imagemUrl?: string;
}