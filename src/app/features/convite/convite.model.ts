// --- Convite / RSVP ---
export type StatusPresenca = 'PENDENTE' | 'CONFIRMADO' | 'NAO_VEM' | 'TALVEZ';

export interface Convidado {
  id: number;
  nome: string;
  status: StatusPresenca;
}

export interface ConviteResponse {
  id: number;
  codigo: string;
  familia: string;
  convidados: Convidado[];
}

export interface RsvpRequest {
  convidadoId: number;
  status: StatusPresenca;
}

