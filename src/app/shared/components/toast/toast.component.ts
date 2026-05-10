import { Component, inject } from '@angular/core';
import { NgClass, NgFor } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [NgClass, NgFor],
  templateUrl: './toast.component.html',
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      max-width: 360px;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: white;
      border-radius: 14px;
      padding: 0.9rem 1.1rem;
      box-shadow: 0 8px 30px rgba(44,32,53,0.18);
      border-left: 4px solid var(--serenity);
      font-size: 0.85rem;
      color: var(--text-dark);
      animation: fadeInUp 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;

      &--success { border-left-color: #27ae60; .toast__icon { color: #27ae60; } }
      &--error   { border-left-color: #e74c3c; .toast__icon { color: #e74c3c; } }
      &--info    { border-left-color: var(--serenity); .toast__icon { color: var(--serenity-dark); } }
    }

    .toast__icon {
      font-size: 1rem;
      font-weight: 700;
      flex-shrink: 0;
    }

    .toast__msg { flex: 1; line-height: 1.4; }

    .toast__close {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1.1rem;
      color: var(--text-soft);
      flex-shrink: 0;
      line-height: 1;
      padding: 0 0 0 0.3rem;
      &:hover { color: var(--text-dark); }
    }
  `],
})
export class ToastComponent {
  toastSvc = inject(ToastService);

  trackById(index: number, item: any) {
    return item.id;
  }
}