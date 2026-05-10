import { Component, Input } from '@angular/core';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-butterfly',
  standalone: true,
  imports: [NgStyle],
  template: `
    <svg
      class="butterfly"
      [class]="'butterfly--delay-' + delay"
      [ngStyle]="{ top: top, left: left, right: right, width: size, position: 'absolute', opacity: opacity, pointerEvents: 'none' }"
      viewBox="0 0 100 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M50 40 C30 20 5 15 10 40 C15 60 40 55 50 40Z" [attr.fill]="colorLeft"/>
      <path d="M50 40 C70 20 95 15 90 40 C85 60 60 55 50 40Z" [attr.fill]="colorRight"/>
      <path d="M50 40 C35 50 25 70 35 72 C45 74 50 55 50 40Z" [attr.fill]="colorLeft" opacity="0.7"/>
      <path d="M50 40 C65 50 75 70 65 72 C55 74 50 55 50 40Z" [attr.fill]="colorRight" opacity="0.7"/>
      <!-- antennae -->
      <line x1="50" y1="40" x2="45" y2="20" stroke="#8A7A9A" stroke-width="1.2" stroke-linecap="round"/>
      <line x1="50" y1="40" x2="55" y2="20" stroke="#8A7A9A" stroke-width="1.2" stroke-linecap="round"/>
      <circle cx="44" cy="19" r="1.5" fill="#8A7A9A"/>
      <circle cx="56" cy="19" r="1.5" fill="#8A7A9A"/>
    </svg>
  `,
  styles: [`
    .butterfly {
      animation: flutter 6s ease-in-out infinite;
    }
    .butterfly--delay-1 { animation-delay: -2s; }
    .butterfly--delay-2 { animation-delay: -4s; }
    .butterfly--delay-3 { animation-delay: -1s; }
    .butterfly--delay-4 { animation-delay: -3s; }
  `],
})
export class ButterflyComponent {
  @Input() top?: string;
  @Input() left?: string;
  @Input() right?: string;
  @Input() size = '70px';
  @Input() colorLeft = '#B8CCE8';
  @Input() colorRight = '#E2C8EC';
  @Input() opacity = '0.18';
  @Input() delay: 1 | 2 | 3 | 4 = 1;
}