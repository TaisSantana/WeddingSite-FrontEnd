// --- Convite / RSVP ---
export type StatusPresenca = 'PENDENTE' | 'CONFIRMADO' | 'NAO_VEM' | 'TALVEZ';

export interface ConvidadoDTO {
  id: number;
  nome: string;
  status: StatusPresenca;
  codigoConvite: string;
}

export interface ConvidadoForm {
  nome: string;
  status: StatusPresenca;
  codigoConvite: string;
}

export interface ConviteResponse {
  id: number;
  codigo: string;
  familia: string;
  convidados: ConvidadoDTO[];
}


export interface RsvpRequest {
  convidadoId: number;
  status: StatusPresenca;
}

