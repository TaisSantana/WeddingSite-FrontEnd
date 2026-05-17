import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';


import { BrlPipe }                 from '../../shared/pipes/brl.pipe';
import { ToastService } from 'src/app/shared/components/toast/toast.service';
import { PresenteRecebidoDTO } from '../presente-recebido/presente-recebido.model';
import { PresenteRecebidoService } from '../presente-recebido/presente-recebido.service';
import { ConvidadoDTO, ConvidadoForm, ConviteResponse } from '../convite/convite.model';
import { AdminLoginRequest, ConviteAdminRequest } from './admin.model';
import { AuthService } from './Auth.service';
import { ConviteService } from '../convite/convite.service';
import { CatalogoPresente, CatalogoPresenteForm } from '../catalogo-presente/catalogo-presente.model';
import { CatalogoPresenteService } from '../catalogo-presente/catalogo-presente.service';
import { ToastComponent } from "src/app/shared/components/toast/toast.component";


type AdminTab = 'dashboard' | 'catalogo' | 'presentes' | 'presencas' | 'mensagens' | 'convites';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, BrlPipe, ToastComponent],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit {

  // ── Auth ──────────────────────────────────
  loginUser = '';
  loginPass = '';
  loginErr  = '';
  logging   = false;

  // ── Tab ───────────────────────────────────
  activeTab: AdminTab = 'dashboard';

  // ── Catálogo ──────────────────────────────
  catalogo: CatalogoPresente[] = [];
  showGiftForm = false;
  giftForm: CatalogoPresenteForm = { nome: '', descricao: '', valor: 0};

  // ── Presentes recebidos ───────────────────
  presentesRecebidos: PresenteRecebidoDTO[] = [];

  // ── Convites ──────────────────────────────
  convites: ConviteResponse[] = [];
  showConviteForm = false;
  conviteForm = { codigo: '', familia: '', convidadosStr: '' };

  //---Convidados------------------------------
  showConvidadosForm = false;
  convidadosForm: ConvidadoForm = {
    nome: '', codigoConvite: '',
    status: 'PENDENTE'
  };

  // ── Computed ──────────────────────────────
  get totalArrecadado(): number {
    return this.presentesRecebidos
      .filter(p => p.statusPagamento === 'PAGO')
      .reduce((s, p) => s + p.total, 0);
  }

  get mensagens(): PresenteRecebidoDTO[] {
    return this.presentesRecebidos.filter(p => p.mensagem && p.mensagem.trim());
  }

  get ultimosPresentes(): PresenteRecebidoDTO[] {
    return [...this.presentesRecebidos].reverse().slice(0, 5);
  }

  get confirmados(): number {
    return this.convites.flatMap(c => c.convidados)
      .filter(g => g.status === 'CONFIRMADO').length;
  }

  get pendentes(): number {
    return this.convites.flatMap(c => c.convidados)
      .filter(g => g.status === 'PENDENTE').length;
  }

  get talvez(): number {
    return this.convites.flatMap(c => c.convidados)
      .filter(g => g.status === 'TALVEZ').length;
  }

  get naoVem(): number {
    return this.convites.flatMap(c => c.convidados)
      .filter(g => g.status === 'NAO_VEM').length;
  }

  constructor(
    public  auth:              AuthService,
    private catalogoSvc:       CatalogoPresenteService,
    private presenteRecebidoS: PresenteRecebidoService,
    private conviteSvc:        ConviteService,
    private toastSvc:          ToastService,
  ) {}

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) this.loadData();
  }

  // ── Login ─────────────────────────────────
  login(): void {
    const req: AdminLoginRequest = {
      username: this.loginUser,
      password: this.loginPass,
    };
    this.logging  = true;
    this.loginErr = '';
    this.auth.login(req).subscribe({
      next:  () => { this.logging = false; this.loadData(); },
      error: () => { this.logging = false; this.loginErr = 'Usuário ou senha incorretos.'; },
    });
  }

  logout(): void { this.auth.logout(); }

  // ── Carregar dados ────────────────────────
  loadData(): void {
    this.catalogoSvc.listar()
      .subscribe({ next: c => this.catalogo = c, error: () => {} });
    this.presenteRecebidoS.listar()
      .subscribe({ next: p => this.presentesRecebidos = p, error: () => {} });
    this.conviteSvc.listar()
      .subscribe({ next: c => this.convites = c, error: () => {} });
  }

  setTab(tab: AdminTab): void { this.activeTab = tab; }

  // ── Helpers ───────────────────────────────
  confirmadosCount(convite: ConviteResponse): number {
    return convite.convidados.filter(g => g.status === 'CONFIRMADO').length;
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      CONFIRMADO: 'badge--confirm',
      TALVEZ:     'badge--maybe',
      NAO_VEM:    'badge--decline',
      PENDENTE:   'badge--pending',
    };
    return map[status] ?? '';
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      CONFIRMADO: '✓ Confirmado',
      TALVEZ:     '? Talvez',
      NAO_VEM:    '✗ Não vem',
      PENDENTE:   '⏳ Pendente',
    };
    return map[status] ?? status;
  }

  statusPagLabel(status: string): string {
    const map: Record<string, string> = {
      PAGO:     '✓ Pago',
      PENDENTE: '⏳ Pendente',
      EXPIRADO: '✗ Expirado',
      RECUSADO: '✗ Recusado',
    };
    return map[status] ?? status;
  }

  pagamentoLabel(forma: string): string {
    return forma === 'PIX' ? '📱 Pix' : '💳 Cartão';
  }


   _editandoConviteId: number | null = null;

  editarConvite(c: ConviteResponse): void {
    this.conviteForm = {
      codigo:        c.codigo,
      familia:       c.familia,
      convidadosStr: c.convidados.map(g => g.nome).join('\n'),
    };
    this._editandoConviteId = c.id;
    this.showConviteForm    = true;
    this.activeTab          = 'convites';
  }

  // ── Catálogo ──────────────────────────────────────────────
addPresente(): void {
  // ...validação...
  this.catalogoSvc.criar({ ...this.giftForm }).subscribe({
    next: p => {
      this.showGiftForm = false;
      this.giftForm     = { nome: '', descricao: '', valor: 0 };
      this.toastSvc.success('"' + p.nome + '" adicionado! 🎁');
      this.loadData();
    },
    error: () => this.toastSvc.error('Erro ao adicionar presente.'),
  });
}

removePresente(id: number): void {
  if (!confirm('Remover este presente do catálogo?')) return;
  this.catalogoSvc.deletar(id).subscribe({
    next: () => {
      this.toastSvc.success('Presente removido.');
      this.loadData();
    },
    error: () => this.toastSvc.error('Erro ao remover.'),
  });
}

// ── Convites ──────────────────────────────────────────────
addConvite(): void {
  // ...validação e lógica de editar/criar...
  // no next de ambos os branches:
  this.toastSvc.success('Convite criado!');   // ou 'atualizado!'
  this.loadData();
}

removeConvite(id: number): void {
  if (!confirm('Remover este convite?')) return;
  this.conviteSvc.deletar(id).subscribe({
    next: () => {
      this.toastSvc.success('Convite removido.');
      this.loadData();
    },
    error: () => this.toastSvc.error('Erro ao remover convite.'),
  });
}

// ── Convidados ────────────────────────────────────────────
  
  addConvidado(): void {
    if (!this.convidadosForm.nome.trim() || !this.convidadosForm.codigoConvite) {
      this.toastSvc.error('Preencha nome e selecione um convite.');
      return;
    }

    const dto: ConvidadoDTO = {
      id:            0,
      nome:          this.convidadosForm.nome.trim(),
      codigoConvite: this.convidadosForm.codigoConvite,
      status:        'PENDENTE',
    };

    this.conviteSvc.criarConvidado(dto).subscribe({
      next: () => {
        this.showConvidadosForm = false;
        this.convidadosForm = { nome: '', codigoConvite: '', status: 'PENDENTE' };
        this.toastSvc.success('Convidado adicionado!');
        this.loadData();
      },
      error: (err) => {
        console.error('Erro ao criar convidado:', err);
        this.toastSvc.error('Erro ao adicionar convidado.');
      },
    });
  }

  // ── Editar convidado inline ───────────────────────────────
  _editandoConvidadoId: number | null = null;
  convidadoEditForm: ConvidadoForm = { nome: '', status: 'PENDENTE' , codigoConvite: ''};

  abrirEdicaoConvidado(g: ConvidadoDTO): void {
    this._editandoConvidadoId = g.id;
    this.convidadoEditForm = { nome: g.nome, status: g.status, codigoConvite: g.codigoConvite };
  }

  cancelarEdicaoConvidado(): void {
    this._editandoConvidadoId = null;
  }

  _salvandoConvidadoId: number | null = null;


  salvarEdicaoConvidado(g: ConvidadoDTO): void {
    if (!this.convidadoEditForm.nome.trim()) return;

    const dto: ConvidadoDTO = {
      ...g,
      nome:          this.convidadoEditForm.nome.trim(),
      status:        this.convidadoEditForm.status ?? g.status,
      codigoConvite: this.convidadoEditForm.codigoConvite,
    };

    this._salvandoConvidadoId = g.id;

    this.conviteSvc.atualizarConvidado(g.id, dto).subscribe({
      next: () => {
        this._salvandoConvidadoId = null;
        this._editandoConvidadoId = null;
        this.loadData();
        this.toastSvc.success('Convidado atualizado!');

      },
      error: () => {
        this._salvandoConvidadoId = null;
        this.toastSvc.error('Erro ao atualizar. Tente novamente.');
      },
    });
  }


  // Editar Convidado----------
  codigoSugestoes: ConviteResponse[] = [];

  filtrarCodigos(event: Event): void {
    const termo = (event.target as HTMLInputElement).value.toUpperCase();
    if (!termo) {
      this.codigoSugestoes = [];
      return;
    }
    this.codigoSugestoes = this.convites.filter(c =>
      c.codigo.includes(termo) || c.familia.toUpperCase().includes(termo)
    );
  }

  selecionarCodigo(c: ConviteResponse): void {
    this.convidadoEditForm.codigoConvite = c.codigo;
    this.codigoSugestoes = [];
  }

  fecharSugestoes(): void {
    // timeout pequeno pra deixar o mousedown do item disparar antes do blur
    setTimeout(() => this.codigoSugestoes = [], 150);
  }
  

  // ── Remover ──────────────────────────────────

  removerConvidado(conviteId: number, convidadoId: number): void {
    const conv = this.convites.find(c => c.id === conviteId);
    const g    = conv?.convidados.find(x => x.id === convidadoId);

    this.abrirModalConfirm({
      titulo:   'Remover convidado?',
      mensagem: 'Esta ação não pode ser desfeita.',
      nomeAlvo: g?.nome ?? 'este convidado',
      onConfirmar: () => {
        this.conviteSvc.removerConvidado(convidadoId).subscribe({
          next:  () => {  this.loadData(); this.toastSvc.success('Convidado removido.'); },
          error: () => this.toastSvc.error('Erro ao remover convidado.'),
        });
      },
    });
  }

  modalConfirm: {
    visivel:     boolean;
    titulo:      string;
    mensagem:    string;
    nomeAlvo:    string;
    onConfirmar: () => void;
  } = { visivel: false, titulo: '', mensagem: '', nomeAlvo: '', onConfirmar: () => {} };

  abrirModalConfirm(config: {
    titulo: string;
    mensagem: string;
    nomeAlvo: string;
    onConfirmar: () => void;
  }): void {
    this.modalConfirm = { visivel: true, ...config };
  }

  fecharModalConfirm(): void {
    this.modalConfirm.visivel = false;
  }

  confirmarModal(): void {
    this.modalConfirm.onConfirmar();
    this.fecharModalConfirm();
  }
}