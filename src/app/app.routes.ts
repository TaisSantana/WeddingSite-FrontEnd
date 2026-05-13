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
      import('./features/catalogo-presente/catalogo-presente.component')
        .then(m => m.CatalogoPresenteComponent)
  },
  {
    path: 'presenca',
    loadComponent: () =>
      import('./features/convite/convite.component')
        .then(m => m.ConviteComponent)
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
      import('./features/catalogo-presente/catalogo-presente.component')
        .then(m => m.CatalogoPresenteComponent)
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./features/admin/admin.component')
        .then(m => m.AdminComponent)
  },

  {
    // Rota de retorno do Mercado Pago após checkout do cartão
    // MP redireciona para: /carrinho/sucesso?collection_status=approved&...
    path: 'carrinho/sucesso',
    loadComponent: () =>
      import('./features/carrinho/retorno-mp.component').then(m => m.RetornoMpComponent),
  },
  {
    path: 'carrinho/pendente',
    loadComponent: () =>
      import('./features/carrinho/retorno-mp.component').then(m => m.RetornoMpComponent),
  },
  {
    path: 'carrinho/falha',
    loadComponent: () =>
      import('./features/carrinho/retorno-mp.component').then(m => m.RetornoMpComponent),
  },

  {
    path: '**',
    redirectTo: ''
  }
];