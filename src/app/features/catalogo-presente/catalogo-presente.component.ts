import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgClass, NgFor, NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from 'src/app/shared/components/toast/toast.service';
import { CarrinhoService } from '../carrinho/carrinho.service';
import { BrlPipe } from 'src/app/shared/pipes/brl.pipe';
import { CatalogoPresente } from './catalogo-presente.model';
import { CatalogoPresenteService } from './catalogo-presente.service';

type ViewMode = 'grid' | 'list';
type SortMode = 'asc' | 'desc';

@Component({
  selector: 'app-gifts',
  standalone: true,
  imports: [NgClass, FormsModule, BrlPipe, NgFor, NgIf, NgSwitch, NgSwitchCase],
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
  sortMode = signal<SortMode>('asc');
  presentes = signal<CatalogoPresente[]>([]);

  precoMin = signal<number | null>(null);
  precoMax = signal<number | null>(null);
  filtroValorAberto = signal(false);

  presentesFiltrados = computed(() => {
    const termo = this.busca().toLowerCase();
    let filtrados = this.presentes().filter(p =>
      p.nome.toLowerCase().includes(termo) ||
      (p.descricao || '').toLowerCase().includes(termo)
    );

    const min = this.precoMin();
    const max = this.precoMax();
    if (min !== null) filtrados = filtrados.filter(p => p.valor >= min);
    if (max !== null) filtrados = filtrados.filter(p => p.valor <= max);

    return [...filtrados].sort((a, b) =>
      this.sortMode() === 'asc' ? a.valor - b.valor : b.valor - a.valor
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

  toggleSort(): void {
    this.sortMode.set(this.sortMode() === 'asc' ? 'desc' : 'asc');
  }

  toggleFiltroValor(): void {
    this.filtroValorAberto.update(v => !v);
  }

  setPrecoMin(valor: string): void {
    const num = valor.trim() === '' ? null : Number(valor);
    this.precoMin.set(num === null || isNaN(num) ? null : num);
  }

  setPrecoMax(valor: string): void {
    const num = valor.trim() === '' ? null : Number(valor);
    this.precoMax.set(num === null || isNaN(num) ? null : num);
  }

  limparFiltroValor(): void {
    this.precoMin.set(null);
    this.precoMax.set(null);
  }

  get temFiltroValorAtivo(): boolean {
    return this.precoMin() !== null || this.precoMax() !== null;
  }

  trackById(_index: number, item: CatalogoPresente): number {
    return item.id;
  }
}