import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild
} from '@angular/core';

import {
  CommonModule,
  NgClass,
  NgFor,
  NgIf
} from '@angular/common';

import { FormsModule } from '@angular/forms';

import {
  ConviteResponse
} from 'src/app/features/convite/convite.model';

import { ConviteService } from 'src/app/features/convite/convite.service';

import { ToastService } from 'src/app/shared/components/toast/toast.service';

import { ConfirmModalComponent } from 'src/app/shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-admin-convites-tab',
  standalone: true,
  templateUrl: './admin-convites-tab.component.html',
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
export class AdminConvitesTabComponent {

  @Input() convites: ConviteResponse[] = [];

  @Output() reload = new EventEmitter<void>();

  @ViewChild('confirmModal')
  confirmModal!: ConfirmModalComponent;

  // EXPAND
  expandedCodigos = new Set<string>();

  toggleExpand(codigo: string): void {
    if (this.expandedCodigos.has(codigo)) {
      this.expandedCodigos.delete(codigo);
    } else {
      this.expandedCodigos.add(codigo);
    }
  }

  // ─────────────────────────────────────────
  // FORM
  // ─────────────────────────────────────────

  showConviteForm = false;

  conviteForm = {
    codigo: '',
    familia: '',
    convidadosStr: ''
  };

  // ─────────────────────────────────────────
  // EDIÇÃO
  // ─────────────────────────────────────────

  _editandoConviteCodigo: string | null = null;

  conviteEditForm = {
    codigo: '',
    familia: '',
    convidadosStr: ''
  };

  _salvandoConviteCodigo: string | null = null;

  // ─────────────────────────────────────────
  // REMOÇÃO
  // ─────────────────────────────────────────

  conviteRemoverCodigo: string | null = null;
  conviteRemoverNome = '';

  constructor(
    private conviteSvc: ConviteService,
    private toastSvc: ToastService
  ) {}

  // ─────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────

  confirmadosCount(convite: ConviteResponse): number {

    return convite.convidados
      .filter(g => g.status === 'CONFIRMADO')
      .length;

  }

  // ─────────────────────────────────────────
  // CRIAR
  // ─────────────────────────────────────────

  addConvite(): void {

    if (
      !this.conviteForm.familia.trim() ||
      !this.conviteForm.convidadosStr.trim()
    ) {

      this.toastSvc.error('Preencha todos os campos.');
      return;

    }

    const payload = {

      codigo: this.conviteForm.codigo.trim(),

      familia: this.conviteForm.familia.trim(),

      convidados: this.conviteForm.convidadosStr
        .split('\n')
        .map(x => x.trim())
        .filter(Boolean)

    };

    this.conviteSvc.criarConvite(payload).subscribe({

      next: () => {

        this.toastSvc.success('Convite criado!');

        this.conviteForm = {
          codigo: '',
          familia: '',
          convidadosStr: ''
        };

        this.showConviteForm = false;

        this.reload.emit();

      },

      error: () => {

        this.toastSvc.error('Erro ao criar convite.');

      }

    });

  }

  // ─────────────────────────────────────────
  // EDITAR
  // ─────────────────────────────────────────

  abrirEdicaoConvite(c: ConviteResponse): void {

    this._editandoConviteCodigo = c.codigo;

    this.conviteEditForm = {

      codigo: c.codigo,

      familia: c.familia,

      convidadosStr: c.convidados
        .map(g => g.nome)
        .join('\n')

    };

  }

  cancelarEdicaoConvite(): void {

    this._editandoConviteCodigo = null;

    this.conviteEditForm = {
      codigo: '',
      familia: '',
      convidadosStr: ''
    };

  }

  salvarEdicaoConvite(c: ConviteResponse): void {

    if (
      !this.conviteEditForm.convidadosStr.trim() ||
      !this.conviteEditForm.familia.trim()
    ) {

      this.toastSvc.error('Preencha todos os campos.');
      return;

    }

    this._salvandoConviteCodigo = c.codigo;

    const payload = {

      codigo: this.conviteEditForm.codigo.trim(),

      familia: this.conviteEditForm.familia.trim()

    };

    // IMPORTANTE:
    // usa codigo ao invés de id

    this.conviteSvc.atualizar(c.codigo, payload).subscribe({

      next: () => {

        this.toastSvc.success('Convite atualizado!');

        this._salvandoConviteCodigo = null;

        this.cancelarEdicaoConvite();

        this.reload.emit();

      },

      error: () => {

        this._salvandoConviteCodigo = null;

        this.toastSvc.error('Erro ao atualizar convite.');

      }

    });

  }

  // ─────────────────────────────────────────
  // REMOVER
  // ─────────────────────────────────────────

  abrirRemocaoConvite(c: ConviteResponse): void {

    this.conviteRemoverCodigo = c.codigo;
    this.conviteRemoverNome = c.familia;

    this.confirmModal.open({

      titulo: 'Remover convite',

      nomeAlvo: c.familia,

      mensagem: 'Todos os convidados desse convite serão removidos.',

      onConfirmar: () => {

        // IMPORTANTE:
        // usa codigo ao invés de id

        this.conviteSvc.deletarConvite(c.codigo)
          .subscribe({

            next: () => {

              this.confirmModal.close();

              this.conviteRemoverCodigo = null;
              this.conviteRemoverNome = '';

              this.toastSvc.success('Convite removido.');

              this.reload.emit();

            },

            error: () => {

              this.toastSvc.error('Erro ao remover convite.');

            }

          });

      }

    });

  }

  get convidadosPreview(): string[] {

    return this.conviteForm.convidadosStr
      .split('\n')
      .map(x => x.trim())
      .filter(x => x.length > 0);

  }

}