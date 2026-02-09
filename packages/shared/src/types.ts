export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  discount: number;
}

export interface CartState {
  items: CartItem[];
  discount: number; // order-level discount
}
