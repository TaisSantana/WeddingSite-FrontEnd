import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from 'src/app/shared/components/toast/toast.service';
import { CarrinhoService } from '../carrinho/carrinho.service';
import { BrlPipe } from 'src/app/shared/pipes/brl.pipe';
import { CatalogoPresente } from './catalogo-presente.model';
import { CatalogoPresenteService } from './catalogo-presente.service';

type ViewMode = 'grid' | 'list';

@Component({
  selector: 'app-gifts',
  standalone: true,
  imports: [NgClass, FormsModule, BrlPipe, NgFor, NgIf],
  templateUrl: './catalogo-presente.component.html',
  styleUrls: ['./catalogo-presente.component.scss'],
})
export class CatalogoPresenteComponent implements OnInit {
  private presenteSvc = inject(CatalogoPresenteService);
  private cartSvc     = inject(CarrinhoService);
  private toastSvc    = inject(ToastService);
  private router      = inject(Router);

  busca    = signal('');
  viewMode = signal<ViewMode>('grid');
  presentes = signal<CatalogoPresente[]>([]);

  presentesFiltrados = computed(() => {
    const termo = this.busca().toLowerCase();
    return this.presentes().filter(p =>
      p.nome.toLowerCase().includes(termo) ||
      (p.descricao || '').toLowerCase().includes(termo)
    );
  });

  ngOnInit(): void {
    this.presenteSvc.listar().subscribe(p => this.presentes.set(p));
  }

  isInCart(id: number): boolean {
    return this.cartSvc.has(id);
  }

  addToCart(presente: CatalogoPresente): void {
    const ok = this.cartSvc.add(presente);
    if (ok) {
      this.toastSvc.success(`"${presente.nome}" adicionado ao carrinho! 🎁`);
      setTimeout(() => this.router.navigate(['/carrinho']), 1200);
    } else {
      this.toastSvc.error('Este presente já está no seu carrinho.');
    }
  }

  setViewMode(mode: ViewMode): void {
    this.viewMode.set(mode);
  }

  setBusca(valor: string): void {
    this.busca.set(valor);
  }

  trackById(_index: number, item: CatalogoPresente): number {
    return item.id;
  }
}