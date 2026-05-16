import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';


import { BrlPipe }                 from '../../shared/pipes/brl.pipe';
import { ToastService } from 'src/app/shared/components/toast/toast.service';
import { PresenteRecebidoDTO } from '../presente-recebido/presente-recebido.model';
import { PresenteRecebidoService } from '../presente-recebido/presente-recebido.service';
import { ConvidadoDTO, ConviteResponse } from '../convite/convite.model';
import { AdminLoginRequest, ConviteAdminRequest } from './admin.model';
import { AuthService } from './Auth.service';
import { ConviteService } from '../convite/convite.service';
import { CatalogoPresente, CatalogoPresenteForm } from '../catalogo-presente/catalogo-presente.model';
import { CatalogoPresenteService } from '../catalogo-presente/catalogo-presente.service';


type AdminTab = 'dashboard' | 'catalogo' | 'presentes' | 'presencas' | 'mensagens' | 'convites';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, BrlPipe],
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
  removerConvidado(conviteId: number, convidadoId: number): void {
    if (!confirm('Remover este convidado?')) return;
    this.conviteSvc.removerConvidado(convidadoId).subscribe({
      next: () => {
        this.toastSvc.success('Convidado removido.');
        this.loadData();
      },
      error: () => this.toastSvc.error('Erro ao remover convidado.'),
    });
  }

  editarConvidado(conv: ConviteResponse, g: ConvidadoDTO): void {
    const novoNome = prompt('Editar nome do convidado:', g.nome);
    if (!novoNome?.trim()) return;

    this.conviteSvc.atualizarConvidado(g.id, { ...g, nome: novoNome.trim() }).subscribe({
      next: () => {
        this.toastSvc.success('Convidado atualizado!');
        this.loadData();
      },
      error: () => this.toastSvc.error('Erro ao atualizar convidado.'),
    });
  }
}