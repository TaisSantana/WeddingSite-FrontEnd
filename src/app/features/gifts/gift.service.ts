import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

//import { Presente, PresenteForm } from '../models';
import { environment } from 'src/environments/environment';
import { Gift, GiftForm } from './gift.model';

// ── Mock data for development without backend ──────────────
const MOCK_PRESENTES: Gift[] = [
  { id: 1,  nome: 'Só pra não dizer que eu não dei nada 😎',   descricao: 'Não foi muito, mas também não fui embora sem dar nada.', valor: 50, imagemUrl: 'assets/images/julius.jpg'}
  /*{ id: 2,  nome: 'Cafeteira Italiana',         descricao: 'Para começar cada manhã juntos com muito café e amor',     valor: 180,  emoji: '☕'},
  { id: 3,  nome: 'Jogo de Toalhas Felpudas',  descricao: '6 peças de algodão egípcio 500g/m² — luxo no dia a dia',  valor: 120,  emoji: '🛁'},
  { id: 4,  nome: 'Aspirador Robô',             descricao: 'Para a casa sempre limpa enquanto aproveitamos a vida',   valor: 650,  emoji: '🤖'},
  { id: 5,  nome: 'Jogo de Cama Queen',         descricao: '400 fios, 100% algodão — noites de sonho garantidas',    valor: 280,  emoji: '🛏️'},
  { id: 6,  nome: 'Airfryer Digital',           descricao: 'Para receitas saudáveis e saborosas todo dia',            valor: 350,  emoji: '🍟'},
  { id: 7,  nome: 'Kit Lua de Mel ✈️',          descricao: 'Contribua para realizarmos a viagem dos nossos sonhos!',  valor: 500,  emoji: '✈️' },
  { id: 8,  nome: 'Adega Climatizada',          descricao: 'Para os bons momentos e vinhos a dois',                  valor: 800,  emoji: '🍷'},
  { id: 9,  nome: 'Jogo de Jantar 12 Peças',   descricao: 'Porcelana para receber família e amigos com elegância',   valor: 220,  emoji: '🍽️'},
  { id: 10, nome: 'Smart TV 55"',               descricao: 'Para nossas noites de filmes no novo lar',               valor: 2200, emoji: '📺'},
  { id: 11, nome: 'Churrasqueira a Gás',        descricao: 'Domingos em família estão garantidos!',                  valor: 900,  emoji: '🥩'},*/
];

@Injectable({ providedIn: 'root' })
export class GiftService {
  private http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/presentes`;

  // Toggle this to use real API
  private useMock = true;

  listar(): Observable<Gift[]> {
    if (this.useMock) return of([...MOCK_PRESENTES]);
    return this.http.get<Gift[]>(this.api);
  }

  criar(dto: GiftForm): Observable<Gift> {
    if (this.useMock) {
      const novo: Gift = { ...dto, id: Date.now() };
      MOCK_PRESENTES.push(novo);
      return of(novo);
    }
    return this.http.post<Gift>(this.api, dto);
  }

  deletar(id: number): Observable<void> {
    if (this.useMock) {
      const i = MOCK_PRESENTES.findIndex(p => p.id === id);
      if (i !== -1) MOCK_PRESENTES.splice(i, 1);
      return of(void 0);
    }
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  formatCurrency(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}