import { Component } from '@angular/core';
import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import { Input } from '@angular/core';
import { ConviteService } from 'src/app/features/convite/convite.service';
import { ToastService } from 'src/app/shared/components/toast/toast.service';
import { FormsModule } from '@angular/forms';
import { Output, EventEmitter } from '@angular/core';
import { ConfirmModalComponent } from 'src/app/shared/components/confirm-modal/confirm-modal.component';
import { ViewChild } from '@angular/core';
import { CatalogoPresenteService } from 'src/app/features/catalogo-presente/catalogo-presente.service';
import { CatalogoPresente, CatalogoPresenteForm } from 'src/app/features/catalogo-presente/catalogo-presente.model';
import { BrlPipe } from "../../../../shared/pipes/brl.pipe";

@Component({
  selector: 'app-admin-catalogo-tab',
  standalone: true,
  templateUrl: './admin-catalogo-tab.component.html',
  styleUrls: ['../../admin.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    NgIf,
    NgFor,
    NgClass,
    ConfirmModalComponent,
    BrlPipe
]
})
export class AdminCatalogoTabComponent {

  constructor(
    private catalogoSvc: CatalogoPresenteService,
    private toastSvc: ToastService,
  ) {}

    // ── Catálogo ──────────────────────────────
    showGiftForm = false;
    catalogoForm: CatalogoPresenteForm = { 
      nome: '', 
      valor: 0
    };

    @Input() catalogo: CatalogoPresente[] = [];
    @Output() reload = new EventEmitter<void>();
    
    @ViewChild('confirmModal')
    confirmModal!: ConfirmModalComponent;

  // ── Catálogo ──────────────────────────────────────────────
  addPresente(): void {
    
    if (!this.catalogoForm.nome.trim() || !this.catalogoForm.valor) {
      this.toastSvc.error('Preencha todos os dados obrigatórios: nome e valor !');
      return;
    }

    this.catalogoSvc.criar({ ...this.catalogoForm }).subscribe({
      next: p => {
        this.showGiftForm = false;
        this.catalogoForm     = { nome: '', valor: 0 };
        this.toastSvc.success('"' + p.nome + '" adicionado! 🎁');
        this.reload.emit();
      },
      error: () => this.toastSvc.error('Erro ao adicionar presente.'),
    });
  }

  removePresente(id: number): void {
    if (!confirm('Remover este presente do catálogo?')) return;
    this.catalogoSvc.deletar(id).subscribe({
      next: () => {
        this.toastSvc.success('Presente removido.');
        this.reload.emit();
      },
      error: () => this.toastSvc.error('Erro ao remover.'),
    });
  }

  removerPresente(id: number): void {
    const pres = this.catalogo.find(c => c.id === id);

    this.confirmModal.open({
      titulo:   'Remover presente?',
      mensagem: 'Esta ação não pode ser desfeita.',
      nomeAlvo: pres?.nome ?? 'este presente',
      onConfirmar: () => {
        this.catalogoSvc.deletar(id)
        .subscribe({
          next:  () => {  this.reload.emit(); this.toastSvc.success('Presente removido!'); },
          error: () => this.toastSvc.error('Erro ao remover convidado.'),
        });
      },
    });
  }


  // ── Editar catalogo inline ───────────────────────────────
  _editandoCatalogoId: number | null = null;
  catalogoEditForm: CatalogoPresenteForm = { nome: '', valor: 0 };

  abrirEdicaoCatalogo(g: CatalogoPresente): void {
      this._editandoCatalogoId = g.id;
      this.catalogoEditForm = { nome: g.nome, valor: g.valor, descricao: g.descricao, imagemUrl: g.imagemUrl};
  }
  
  cancelarEdicaoCatalogo(): void {
    this._editandoCatalogoId = null;
  }

  _salvandoCatalogoId: number | null = null;

  salvarEdicaoCatalogo(g: CatalogoPresente): void {
    if (!this.catalogoEditForm.nome.trim()) return;

    const dto: CatalogoPresente = {
      ...g,
      nome:          this.catalogoEditForm.nome.trim(),
      imagemUrl:     this.catalogoEditForm.imagemUrl ?? g.imagemUrl,
      valor:         Number(this.catalogoEditForm.valor),
      descricao:     this.catalogoEditForm.descricao
    };

    this._salvandoCatalogoId = g.id;

    this.catalogoSvc.atualizar(g.id, dto).subscribe({
      next: () => {
        this._salvandoCatalogoId = null;
        this._editandoCatalogoId = null;
        this.reload.emit();
        this.toastSvc.success('Presente atualizado!');

      },
      error: () => {
        this._salvandoCatalogoId = null;
        this.toastSvc.error('Erro ao atualizar. Tente novamente.');
      },
    });
  }
    
  


}