import { Component } from '@angular/core';
import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import { Input } from '@angular/core';
import { ConvidadoDTO, ConvidadoForm, ConviteResponse } from 'src/app/features/convite/convite.model';
import { ConviteService } from 'src/app/features/convite/convite.service';
import { ToastService } from 'src/app/shared/components/toast/toast.service';
import { FormsModule } from '@angular/forms';
import { Output, EventEmitter } from '@angular/core';
import { ConfirmModalComponent } from 'src/app/shared/components/confirm-modal/confirm-modal.component';
import { ViewChild } from '@angular/core';

@Component({
  selector: 'app-admin-convidados-tab',
  standalone: true,
  templateUrl: './admin-convidados-tab.component.html',
  styleUrls: ['../../admin.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    NgIf,
    NgFor,
    NgClass,
    ConfirmModalComponent
  ]
})
export class AdminConvidadosTabComponent {

  constructor(
    private conviteSvc: ConviteService,
    private toastSvc: ToastService,
  ) {}

  
  showConvidadosForm = false;
  convidadosForm: ConvidadoForm = {
    nome: '', codigoConvite: '',
    status: 'PENDENTE'
  };
  
  @Input() convites: ConviteResponse[] = [];
  @Output() reload = new EventEmitter<void>();

  @ViewChild('confirmModal')
  confirmModal!: ConfirmModalComponent;

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
        this.reload.emit();
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
        this.reload.emit();
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

    this.confirmModal.open({
      titulo:   'Remover convidado?',
      mensagem: 'Esta ação não pode ser desfeita.',
      nomeAlvo: g?.nome ?? 'este convidado',
      onConfirmar: () => {
        this.conviteSvc.removerConvidado(convidadoId)
        .subscribe({
          next:  () => {  this.reload.emit(); this.toastSvc.success('Convidado removido!'); },
          error: () => this.toastSvc.error('Erro ao remover convidado.'),
        });
      },
    });
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
  
}
