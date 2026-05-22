import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmModalConfig } from './confirm-modal.model';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss']
})
export class ConfirmModalComponent {

  visivel = false;

  config: ConfirmModalConfig = {
    titulo: '',
    mensagem: '',
    nomeAlvo: '',
    onConfirmar: () => {}
  };

  open(config: ConfirmModalConfig): void {
    this.config = config;
    this.visivel = true;
  }

  close(): void {
    this.visivel = false;
  }

  confirm(): void {
    this.config.onConfirmar();
    this.close();
  }

}