import { Gift } from "../gifts/gift.model";

// --- Carrinho ---
export interface CartItem {
    presente: Gift;
    addedAt: Date;
  }