import { Injectable, signal, computed } from '@angular/core';
import { CatalogoPresenteItem } from './carrinho.model';
import { CatalogoPresente } from '../catalogo-presente/catalogo-presente.model';

@Injectable({ providedIn: 'root' })
export class CarrinhoService {
  private _items = signal<CatalogoPresenteItem[]>([]);
  
    readonly items = this._items.asReadonly();
    readonly count = computed(() => this._items().length);
    readonly total = computed(() =>
      this._items().reduce((sum, i) => sum + i.presente.valor, 0)
    );

    add(presente: CatalogoPresente): boolean {
      if (this._items().some(i => i.presente.id === presente.id)) {
        return false; // already in cart
      }
      this._items.update(items => [...items, { presente, addedAt: new Date() }]);
      return true;
    }

    remove(presenteId: number): void {
      this._items.update(items => items.filter(i => i.presente.id !== presenteId));
    }

    has(presenteId: number): boolean {
      return this._items().some(i => i.presente.id === presenteId);
    }

    clear(): void {
      this._items.set([]);
    }

    formatTotal(): string {
      return this.total().toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });
    }
  
}

