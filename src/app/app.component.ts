import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/Navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,                // 👈 ESSENCIAL
  imports: [RouterOutlet,NavbarComponent],         // 👈 para rotas funcionarem
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'wedding-site';
}