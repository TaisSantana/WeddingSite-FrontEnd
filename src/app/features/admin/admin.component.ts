import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';


import { BrlPipe }                 from '../../shared/pipes/brl.pipe';
import { ToastService } from 'src/app/shared/components/toast/toast.service';
import { PresenteRecebidoDTO } from '../presente-recebido/presente-recebido.model';
import { PresenteRecebidoService } from '../presente-recebido/presente-recebido.service';
import { ConvidadoDTO, ConvidadoForm, ConviteResponse } from '../convite/convite.model';
import { AdminLoginRequest, ConviteAdminRequest } from './admin.model';
import { AuthService } from './auth.service';
import { ConviteService } from '../convite/convite.service';
import { CatalogoPresente, CatalogoPresenteForm } from '../catalogo-presente/catalogo-presente.model';
import { CatalogoPresenteService } from '../catalogo-presente/catalogo-presente.service';
import { ToastComponent } from "src/app/shared/components/toast/toast.component";
import { AdminConvidadosTabComponent } from './components/convidados-tab/admin-convidados-tab.component';
import { AdminConvitesTabComponent } from "./components/convites-tab/admin-convites-tab.component";


type AdminTab = 'dashboard' | 'catalogo' | 'presentes' | 'presencas' | 'mensagens' | 'convites';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, BrlPipe, ToastComponent, AdminConvidadosTabComponent, AdminConvitesTabComponent],
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

}