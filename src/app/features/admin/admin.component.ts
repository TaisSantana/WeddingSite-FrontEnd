import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';


import { BrlPipe }                 from '../../shared/pipes/brl.pipe';
import { ToastService } from 'src/app/shared/components/toast/toast.service';
import { PresenteRecebidoDTO } from '../presente-recebido/presente-recebido.model';
import { PresenteRecebidoService } from '../presente-recebido/presente-recebido.service';
import { ConviteResponse } from '../convite/convite.model';
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

  // ── Catálogo CRUD ─────────────────────────
  addPresente(): void {
    if (!this.giftForm.nome.trim() || !this.giftForm.valor) {
      this.toastSvc.error('Preencha nome e valor!');
      return;
    }
    this.catalogoSvc.criar({ ...this.giftForm }).subscribe({
      next: p => {
        this.catalogo     = [...this.catalogo, p];
        this.showGiftForm = false;
        this.giftForm     = { nome: '', descricao: '', valor: 0};
        this.toastSvc.success('"' + p.nome + '" adicionado! 🎁');
      },
      error: () => this.toastSvc.error('Erro ao adicionar presente.'),
    });
  }

  removePresente(id: number): void {
    if (!confirm('Remover este presente do catálogo?')) return;
    this.catalogoSvc.deletar(id).subscribe({
      next:  () => {
        this.catalogo = this.catalogo.filter(p => p.id !== id);
        this.toastSvc.success('Presente removido.');
      },
      error: () => this.toastSvc.error('Erro ao remover.'),
    });
  }

  // ── Convites CRUD ─────────────────────────
  addConvite(): void {
    if (!this.conviteForm.codigo.trim() || !this.conviteForm.familia.trim()) {
      this.toastSvc.error('Preencha código e família!');
      return;
    }
    const convidados = this.conviteForm.convidadosStr
      .split('\n').map(s => s.trim()).filter(s => s.length > 0);
    if (!convidados.length) {
      this.toastSvc.error('Adicione pelo menos um convidado!');
      return;
    }
    const dto: ConviteAdminRequest = {
      codigo:     this.conviteForm.codigo.toUpperCase(),
      familia:    this.conviteForm.familia,
      convidados,
    };
    this.conviteSvc.criar(dto).subscribe({
      next: c => {
        this.convites        = [...this.convites, c];
        this.showConviteForm = false;
        this.conviteForm     = { codigo: '', familia: '', convidadosStr: '' };
        this.toastSvc.success('Convite ' + c.codigo + ' criado!');
      },
      error: () => this.toastSvc.error('Erro ao criar convite.'),
    });
  }

  removeConvite(id: number): void {
    if (!confirm('Remover este convite?')) return;
    this.conviteSvc.deletar(id).subscribe({
      next:  () => {
        this.convites = this.convites.filter(c => c.id !== id);
        this.toastSvc.success('Convite removido.');
      },
      error: () => this.toastSvc.error('Erro ao remover convite.'),
    });
  }

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
}