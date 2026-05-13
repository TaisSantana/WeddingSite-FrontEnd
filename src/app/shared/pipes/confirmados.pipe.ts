import { Pipe, PipeTransform } from '@angular/core';
import { Convidado } from 'src/app/features/convite/convite.model';

@Pipe({ name: 'confirmados', standalone: true })
export class ConfirmadosPipe implements PipeTransform {
  transform(convidados: Convidado[]): number {
    return convidados.filter(c => c.status === 'CONFIRMADO').length;
  }
}