import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButterflyComponent } from 'src/app/shared/components/butterfly/Buttlerfly.component';
import { CountdownComponent } from 'src/app/shared/components/countdown/countdown.component';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterLink, CountdownComponent, ButterflyComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {}