import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component')
        .then(m => m.HomeComponent)
  },
  {
    path: 'presentes',
    loadComponent: () =>
      import('./features/gifts/gifts.component')
        .then(m => m.GiftsComponent)
  },
  {
    path: 'presenca',
    loadComponent: () =>
      import('./features/rsvp/rsvp.component')
        .then(m => m.RsvpComponent)
  },
  {
    path: 'local',
    loadComponent: () =>
      import('./features/location/location.component')
        .then(m => m.LocationComponent)
  },
  {
    path: 'carrinho',
    loadComponent: () =>
      import('./features/cart/cart.component')
        .then(m => m.CartComponent)
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./features/auth/admin.component')
        .then(m => m.AdminComponent)
  },

  {
    // Rota de retorno do Mercado Pago após checkout do cartão
    // MP redireciona para: /carrinho/sucesso?collection_status=approved&...
    path: 'carrinho/sucesso',
    loadComponent: () =>
      import('./features/cart/retorno-mp.component').then(m => m.RetornoMpComponent),
  },
  {
    path: 'carrinho/pendente',
    loadComponent: () =>
      import('./features/cart/retorno-mp.component').then(m => m.RetornoMpComponent),
  },
  {
    path: 'carrinho/falha',
    loadComponent: () =>
      import('./features/cart/retorno-mp.component').then(m => m.RetornoMpComponent),
  },

  {
    path: '**',
    redirectTo: ''
  }
];