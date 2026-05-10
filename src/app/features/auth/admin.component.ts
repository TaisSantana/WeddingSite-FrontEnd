import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, NgClass, NgFor, NgIf, SlicePipe } from '@angular/common';
import { BrlPipe } from '../../shared/pipes/brl.pipe';
import { ToastService } from 'src/app/shared/components/toast/toast.service';
import { rsvpService } from '../rsvp/rsvp.service';
import { AuthService } from './Auth.service';
import { AdminLoginRequest } from './admin.model';
import { GiftService } from '../gifts/gift.service';
import { PaymentService} from '../payment/Payment.service';
import { PaymentResponse } from '../payment/Payment.model';
import { Gift, GiftForm } from '../gifts/gift.model';
import { RsvpResponse } from '../rsvp/rsvp.model';


type AdminTab = 'dashboard' | 'presentes' | 'contribuicoes' | 'presencas' | 'mensagens' | 'convites';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [FormsModule, NgClass, BrlPipe,  NgIf, NgFor, DatePipe, SlicePipe],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit {
  auth          = inject(AuthService);
  presenteSvc   = inject(GiftService);
  contribuicaoS = inject(PaymentService);
  conviteSvc    = inject(rsvpService);
  toastSvc      = inject(ToastService);

  // ── Auth ──────────────────────────────────
  loginUser = signal('');
  loginPass = signal('');
  loginErr  = signal('');
  logging   = signal(false);

  // ── Tab ───────────────────────────────────
  activeTab = signal<AdminTab>('dashboard');

  // ── Presentes ─────────────────────────────
  presentes       = signal<Gift[]>([]);
  showGiftForm    = signal(false);
  giftForm        = signal<GiftForm>({ nome: '', descricao: '', valor: 0});
  categorias      = ['Cozinha', 'Quarto', 'Sala', 'Banheiro', 'Viagem', 'Outros'];

  // ── Contribuições ─────────────────────────
  contribuicoes   = signal<PaymentResponse[]>([]);

  // ── Presenças ─────────────────────────────
  convites        = signal<RsvpResponse[]>([]);
  showConviteForm = signal(false);
  conviteForm     = signal({ codigo: '', familia: '', convidadosStr: '' });

  // ── Computed stats ────────────────────────
  stats = computed(() => {
    const cs = this.conviteSvc.statsSummary();
    const totalVal = this.contribuicaoS.totalArrecadado();
    return {
      totalPresentes:       this.presentes().length,
      totalContribuicoes:   this.contribuicoes().length,
      valorTotal:           totalVal,
      ...cs,
    };
  });

  mensagens = computed(() =>
    this.contribuicoes().filter(c => c.mensagem && c.mensagem.trim())
  );

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) this.loadData();
  }

  // ── Login ─────────────────────────────────
  login(): void {
    const req: AdminLoginRequest = { username: this.loginUser(), password: this.loginPass() };
    this.logging.set(true);
    this.loginErr.set('');
    this.auth.login(req).subscribe({
      next: () => { this.logging.set(false); this.loadData(); },
      error: () => { this.logging.set(false); this.loginErr.set('Usuário ou senha incorretos.'); },
    });
  }

  logout(): void { this.auth.logout(); }

  // ── Data ──────────────────────────────────
  loadData(): void {
    this.presenteSvc.listar().subscribe(p => this.presentes.set(p));
    this.contribuicaoS.listar().subscribe(c => this.contribuicoes.set(c));
    //this.convites.set(this.conviteSvc.allConvites());
  }

  setTab(tab: AdminTab): void { this.activeTab.set(tab); }

  // ── Presentes CRUD ────────────────────────
  updateGiftField(field: keyof GiftForm, value: string | number): void {
    this.giftForm.update(f => ({ ...f, [field]: value }));
  }

  addPresente(): void {
    const f = this.giftForm();
    if (!f.nome.trim() || !f.valor) {
      this.toastSvc.error('Preencha nome e valor!');
      return;
    }
    this.presenteSvc.criar(f).subscribe(p => {
      this.presentes.update(ps => [...ps, p]);
      this.showGiftForm.set(false);
      this.giftForm.set({ nome: '', descricao: '', valor: 0});
      this.toastSvc.success(`"${p.nome}" adicionado! 🎁`);
    });
  }

  removePresente(id: number): void {
    if (!confirm('Remover este presente?')) return;
    this.presenteSvc.deletar(id).subscribe(() => {
      this.presentes.update(ps => ps.filter(p => p.id !== id));
      this.toastSvc.success('Presente removido.');
    });
  }

  // ── Convites CRUD ─────────────────────────
  updateConviteField(field: string, value: string): void {
    this.conviteForm.update(f => ({ ...f, [field]: value }));
  }

  addConvite(): void {
    const f = this.conviteForm();
    if (!f.codigo.trim() || !f.familia.trim()) {
      this.toastSvc.error('Preencha código e família!');
      return;
    }
    const convidados = f.convidadosStr
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    if (convidados.length === 0) {
      this.toastSvc.error('Adicione pelo menos um convidado!');
      return;
    }
    this.conviteSvc.criar({ codigo: f.codigo, familia: f.familia, convidados }).subscribe(c => {
      this.convites.update(cs => [...cs, c]);
      this.showConviteForm.set(false);
      this.conviteForm.set({ codigo: '', familia: '', convidadosStr: '' });
      this.toastSvc.success(`Convite ${c.codigo} criado!`);
    });
  }

  removeConvite(id: number): void {
    if (!confirm('Remover este convite?')) return;
    this.conviteSvc.deletar(id).subscribe(() => {
      this.convites.update(cs => cs.filter(c => c.id !== id));
      this.toastSvc.success('Convite removido.');
    });
  }

  // ── Helpers ───────────────────────────────
  confirmadosCount(convite: RsvpResponse): number {
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

  trackById(index: number, item: any) {
    return item.id;
  }

  toggleGiftForm() {
    this.showGiftForm.update(v => !v);
  }

  toggleConviteForm() {
    this.showConviteForm.update(v => !v);
  }
  
}