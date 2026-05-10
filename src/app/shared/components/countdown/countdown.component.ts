import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { environment } from 'src/environments/environment';

interface TimeUnit { value: string; label: string; }

@Component({
  selector: 'app-countdown',
  standalone: true,
  templateUrl:  './countdown.component.html',
  styleUrls: ['./countdown.component.scss'],
  imports: [NgFor, NgIf]
})
export class CountdownComponent implements OnInit, OnDestroy {
  private interval?: ReturnType<typeof setInterval>;
  private readonly wedding = new Date(environment.weddingDate);
  private readonly start = new Date('2024-09-19T00:00:00');

  units = signal<TimeUnit[]>([
    { value: '---', label: 'Dias' },
    { value: '--', label: 'Horas' },
    { value: '--', label: 'Minutos' },
    { value: '--', label: 'Segundos' },
  ]);
  percentage = signal(0);
  progressText = signal('Calculando...');

  ngOnInit(): void {
    this.tick();
    this.interval = setInterval(() => this.tick(), 1000);
  }

  ngOnDestroy(): void {
    if (this.interval) clearInterval(this.interval);
  }

  private tick(): void {
    const now = new Date();
    const diff = this.wedding.getTime() - now.getTime();

    if (diff <= 0) {
      this.units.set([{ value: '🎉', label: 'Chegou!' }]);
      this.percentage.set(100);
      this.progressText.set('O grande dia chegou! 🦋');
      if (this.interval) clearInterval(this.interval);
      return;
    }

    const days    = Math.floor(diff / 86400000);
    const hours   = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    this.units.set([
      { value: String(days).padStart(3, '0'),    label: 'Dias' },
      { value: String(hours).padStart(2, '0'),   label: 'Horas' },
      { value: String(minutes).padStart(2, '0'), label: 'Minutos' },
      { value: String(seconds).padStart(2, '0'), label: 'Segundos' },
    ]);

    const total   = this.wedding.getTime() - this.start.getTime();
    const elapsed = now.getTime() - this.start.getTime();
    const pct     = Math.min(100, Math.max(0, (elapsed / total) * 100));
    this.percentage.set(Math.round(pct * 10) / 10);

    if (days > 200) {
      this.progressText.set(`Ainda ${days} dias — mas vai valer cada segundo! 🦋`);
    } else if (days > 30) {
      this.progressText.set(`Quase lá! Só mais ${days} dias para o grande momento...`);
    } else if (days > 7) {
      this.progressText.set(`Faltam ${days} dias! A festa está chegando! 🎉`);
    } else {
      this.progressText.set(`FALTAM APENAS ${days} DIA${days === 1 ? '' : 'S'}!!! 🎊💍`);
    }
  }

  trackByLabel(index: number, item: any) {
    return item.label;
  }
}