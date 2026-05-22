export interface ConfirmModalConfig {
  titulo: string;
  mensagem: string;
  nomeAlvo: string;
  onConfirmar: () => void;
}