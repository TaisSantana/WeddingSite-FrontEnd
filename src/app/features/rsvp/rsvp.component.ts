import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { ToastService } from 'src/app/shared/components/toast/toast.service';
import { StatusPresenca, RsvpRequest, RsvpResponse } from './rsvp.model';
import { ConfirmadosPipe } from 'src/app/shared/pipes/confirmados.pipe';
import { rsvpService } from './rsvp.service';
import { ToastComponent } from "src/app/shared/components/toast/toast.component";

@Component({
  selector: 'app-presenca',
  standalone: true,
  imports: [FormsModule, NgClass, NgIf, NgFor, ConfirmadosPipe, ToastComponent],
  templateUrl: './rsvp.component.html',
  styleUrls: ['./rsvp.component.scss'],
})
export class RsvpComponent {
  private conviteSvc = inject(rsvpService);
  private toastSvc   = inject(ToastService);

  codigo       = signal('');
  convite      = signal<RsvpResponse | null>(null);
  rsvpMap      = signal<Record<number, StatusPresenca>>({});
  loading      = signal(false);
  saving       = signal(false);
  notFound     = signal(false);

  buscar(): void {
    const code = this.codigo().trim().toUpperCase();
    if (!code) {
      this.toastSvc.error('Digite o código do seu convite!');
      return;
    }

    this.loading.set(true);
    this.notFound.set(false);
    this.convite.set(null);

    this.conviteSvc.buscar(code).subscribe({
      next: (data) => {
        this.convite.set(data);
        // Init rsvp map preserving existing status
        const map: Record<number, StatusPresenca> = {};
        data.convidados.forEach(g => { map[g.id] = g.status; });
        this.rsvpMap.set(map);
        this.loading.set(false);
      },
      error: () => {
        this.notFound.set(true);
        this.loading.set(false);
        this.toastSvc.error('Código não encontrado. Verifique seu convite! 😔');
      },
    });
  }

  setStatus(convidadoId: number, status: StatusPresenca): void {
    this.rsvpMap.update(m => ({ ...m, [convidadoId]: status }));
  }

  getStatus(convidadoId: number): StatusPresenca {
    return this.rsvpMap()[convidadoId] ?? 'PENDENTE';
  }

  salvar(): void {
    const convite = this.convite();
    if (!convite) return;

    const map = this.rsvpMap();
    const rsvps: RsvpRequest[] = convite.convidados
      .filter(g => map[g.id] && map[g.id] !== 'PENDENTE')
      .map(g => ({ convidadoId: g.id, status: map[g.id] }));

    if (rsvps.length === 0) {
      this.toastSvc.error('Selecione pelo menos uma resposta! 😊');
      return;
    }

    this.saving.set(true);

    this.conviteSvc.confirmar(convite.codigo, rsvps).subscribe({
      next: () => {
        this.saving.set(false);
        this.toastSvc.success('Presenças salvas com sucesso! 💌');
        // Re-fetch to update displayed statuses
        this.buscar();
      },
      error: () => {
        this.saving.set(false);
        this.toastSvc.error('Ocorreu um erro. Tente novamente.');
      },
    });
  }

  statusLabel(s: StatusPresenca): string {
    const labels: Record<StatusPresenca, string> = {
      PENDENTE:    '⏳ Pendente',
      CONFIRMADO:  '✓ Confirmado',
      NAO_VEM:     '✗ Não vem',
      TALVEZ:      '? Talvez',
    };
    return labels[s];
  }

  trackById(index: number, item: any) {
    return item.id;
  }
  
}