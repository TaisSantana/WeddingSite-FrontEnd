import { CatalogoPresente } from "../catalogo-presente/catalogo-presente.model";

// Item no carrinho
export interface CatalogoPresenteItem {
  presente: CatalogoPresente;
  addedAt: Date;
}