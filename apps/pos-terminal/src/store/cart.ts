import { create } from "zustand";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  discount: number;
}

interface CartStore {
  items: CartItem[];
  discount: number; // order-level discount
  addItem: (product: { id: string; name: string; price: number }) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setItemDiscount: (productId: string, discount: number) => void;
  setOrderDiscount: (discount: number) => void;
  clear: () => void;
  getSubtotal: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  discount: 0,

  addItem: (product) => {
    set((state) => {
      const existing = state.items.find(
        (item) => item.productId === product.id
      );
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return {
        items: [
          ...state.items,
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            discount: 0,
          },
        ],
      };
    });
  },

  removeItem: (productId) => {
    set((state) => ({
      items: state.items.filter((item) => item.productId !== productId),
    }));
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    set((state) => ({
      items: state.items.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      ),
    }));
  },

  setItemDiscount: (productId, discount) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.productId === productId ? { ...item, discount } : item
      ),
    }));
  },

  setOrderDiscount: (discount) => {
    set({ discount });
  },

  clear: () => {
    set({ items: [], discount: 0 });
  },

  getSubtotal: () => {
    return get().items.reduce(
      (sum, item) => sum + item.price * item.quantity - item.discount,
      0
    );
  },

  getTotal: () => {
    return get().getSubtotal() - get().discount;
  },
}));
