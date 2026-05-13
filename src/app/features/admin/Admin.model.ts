// --- Admin ---
export interface AdminLoginRequest {
    username: string;
    password: string;
  }
  
  export interface AdminLoginResponse {
    token: string;
    expiresIn: number;
  }
  
  export interface AdminStats {
    totalPresentes: number;
    presentesReservados: number;
    totalContribuicoes: number;
    valorTotal: number;
    convidadosConfirmados: number;
    convidadosPendentes: number;
    convidadosNaoVem: number;
  }
  
  export interface ConviteAdminRequest {
    codigo: string;
    familia: string;
    convidados: string[];
  }