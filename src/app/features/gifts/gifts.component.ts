import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Gift } from './gift.model';
import { ToastService } from 'src/app/shared/components/toast/toast.service';
import { CartService } from '../cart/Cart.service';
import { GiftService } from './gift.service';
import { BrlPipe } from 'src/app/shared/pipes/brl.pipe';
import { NgFor, NgIf } from '@angular/common';


@Component({
  selector: 'app-gifts',
  standalone: true,
  imports: [NgClass, FormsModule, BrlPipe,NgFor, NgIf],
  templateUrl: './gift.component.html',
  styleUrls: ['./gift.component.scss'],
})
export class GiftsComponent implements OnInit {
  private presenteSvc = inject(GiftService);
  private cartSvc     = inject(CartService);
  private toastSvc    = inject(ToastService);
  private router      = inject(Router);

  busca = signal('');
  presentes = signal<Gift[]>([]);

  presentesFiltrados = computed(() => {
    const termo = this.busca().toLowerCase();
  
    return this.presentes()
      .filter(p =>
        p.nome.toLowerCase().includes(termo) ||
        p.descricao.toLowerCase().includes(termo)
      );
  });


  ngOnInit(): void {
    this.presenteSvc.listar().subscribe(p => this.presentes.set(p));
  }

  isInCart(id: number): boolean { return this.cartSvc.has(id); }

  addToCart(presente: Gift): void {
    const ok = this.cartSvc.add(presente);
    if (ok) {
      this.toastSvc.success(`"${presente.nome}" adicionado ao carrinho! 🎁`);
      setTimeout(() => this.router.navigate(['/carrinho']), 1200);
    } else {
      this.toastSvc.error('Este presente já está no seu carrinho.');
    }
  }

  trackById(index: number, item: any) {
    return item.id;
  }
  
  setBusca(valor: string) {
    this.busca.set(valor);
  }

}