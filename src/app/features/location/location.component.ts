import { Component } from '@angular/core';

@Component({
  selector: 'app-local',
  standalone: true,
  template: `
    <div class="page-header">
      <span class="section-eyebrow">Como nos encontrar</span>
      <h1 class="section-title" style="font-weight: 700;">O Local</h1>
      <p class="page-header__sub">Natureza Viva — Feira Nova, PE</p>
    </div>

    <div class="local-content">
      <div class="local-info">

        <div class="card local-card">
          <h3>Endereço</h3>
          <div class="detail">
            <span>📍</span>
            <p>Rodovia PE 50, km 27<br>Zona Rural — Feira Nova, PE<br>CEP 55715-000</p>
          </div>
          <div class="detail">
            <span>🕓</span>
            <p>Cerimônia: <strong>19 de Setembro de 2026 às 16h</strong></p>
          </div>
          <div class="detail">
            <span>🚗</span>
            <p>Estacionamento gratuito disponível no local para todos os convidados</p>
          </div>
          <div class="detail">
            <span>🚌</span>
            <p>Caso precise de carona, entre em contato com os noivos pelo WhatsApp</p>
          </div>
        </div>

        <div class="card local-card" style="margin-top: 1.5rem;">
          <h3>Como Chegar</h3>
          <div class="detail">
            <span>🧭</span>
            <p>De Recife: Pegue a BR-232 em direção a Caruaru, depois a PE-50 em direção a Feira Nova. O local fica no km 27, no antigo Restaurante Natureza Viva.</p>
          </div>
          <div class="detail">
            <span>⚠️</span>
            <p>Preste atenção ao plaqueiro "Natureza Viva" na estrada. Chegue com antecedência para aproveitar o evento completo.</p>
          </div>
          <div class="detail">
            <span>📱</span>
            <p>Em caso de dúvida, use o Google Maps com o link abaixo ou ligue para os noivos.</p>
          </div>
          <br>
          <a
            href="https://www.google.com/maps/place/Restaurante+Natureza+Viva/@-7.9517943,-35.3690782,17z"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn--primary">
            🗺️ Abrir no Google Maps
          </a>
        </div>

        <div class="card local-card local-card--info" style="margin-top: 1.5rem;">
          <h3>Informações do Evento</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-icon">👗</span>
              <span class="info-label">Traje</span>
              <span class="info-value">Esporte Fino</span>
            </div>
            <div class="info-item">
              <span class="info-icon">🌡️</span>
              <span class="info-label">Clima</span>
              <span class="info-value">Área aberta — leve algo para o fresquinho da noite</span>
            </div>
            <div class="info-item">
              <span class="info-icon">🍽️</span>
              <span class="info-label">Refeição</span>
              <span class="info-value">Jantar incluso para todos os convidados</span>
            </div>
            <div class="info-item">
              <span class="info-icon">🎶</span>
              <span class="info-label">Festa</span>
              <span class="info-value">Após a cerimônia, até a madrugada!</span>
            </div>
          </div>
        </div>

      </div>

      <div class="local-map">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3929.94!2d-35.3712531!3d-7.9517943!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7aba595a3b46311%3A0x15813e4be6340df9!2sRestaurante%20Natureza%20Viva!5e0!3m2!1spt-BR!2sbr!4v1680000000000!5m2!1spt-BR!2sbr"
          allowfullscreen=""
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade">
        </iframe>
      </div>
    </div>
  `,
  styles: [`
    .local-content {
      max-width: 1100px;
      margin: 0 auto;
      padding: 3rem 1.5rem 5rem;
      display: grid;
      grid-template-columns: 1fr 1.4fr;
      gap: 2.5rem;
      align-items: start;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .local-card {
      padding: 1.8rem;

      h3 {
        font-family: var(--font-serif);
        font-size: 1.3rem;
        font-style: italic;
        color: var(--text-dark);
        margin-bottom: 1.2rem;
        padding-bottom: 0.75rem;
        border-bottom: 2px solid var(--serenity-pale);
      }

      &--info { background: linear-gradient(135deg, var(--serenity-pale), var(--lilac-pale)); }
    }

    .detail {
      display: flex;
      gap: 0.85rem;
      margin-bottom: 0.9rem;
      font-size: 0.87rem;
      color: var(--text-mid);
      line-height: 1.6;

      > span { flex-shrink: 0; margin-top: 2px; }
      strong { color: var(--text-dark); }

      &:last-of-type { margin-bottom: 0; }
    }

    .info-grid {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .info-item {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .info-icon { font-size: 1.1rem; flex-shrink: 0; }

    .info-label {
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--serenity-dark);
      min-width: 70px;
      padding-top: 2px;
    }

    .info-value {
      font-size: 0.87rem;
      color: var(--text-mid);
      line-height: 1.5;
    }

    .local-map {
      position: sticky;
      top: calc(var(--nav-h) + 1rem);
      border-radius: var(--radius-xl);
      overflow: hidden;
      box-shadow: var(--shadow-lg);
      border: 3px solid white;

      iframe {
        width: 100%;
        height: 520px;
        border: none;
        display: block;
      }

      @media (max-width: 768px) {
        position: static;
        iframe { height: 350px; }
      }
    }

    .page-header__sub {
      font-size: 0.88rem;
      color: var(--text-soft);
      margin-top: 0.3rem;
      font-style: italic;
    }
  `],
})
export class LocationComponent {}