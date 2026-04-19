import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types';
import { Coupon } from '@/app/actions/coupons';
import { useAuthStore } from '@/store/auth-store';
import { SupabaseCartRepository } from '@/infrastructure/repositories/SupabaseCartRepository';
import { toast } from 'sonner';

const repo = new SupabaseCartRepository();

const syncWithDB = (items: CartItem[]) => {
  const user = useAuthStore.getState().user;
  if (user) {
    repo.syncCart(user.id, items).catch(console.error);
  }
};

interface CartItem extends Product {
  quantity: number;
  selectedSize: string;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  appliedCoupon: Coupon | null;
  addItem: (product: Product, size: string, quantity?: number) => void;
  removeItem: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setIsOpen: (open: boolean) => void;
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getTotal: () => number;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
  resellerWhatsApp: string | null;
  setResellerWhatsApp: (num: string | null) => void;
  cartStep: 'items' | 'checkout' | 'success' | 'transferencia';
  setCartStep: (step: 'items' | 'checkout' | 'success' | 'transferencia') => void;
  stockAlerts: Record<string, string>;
  initRealtimeSubscription: () => void;
  // Post-checkout order data (persisted for success page)
  lastOrder: {
    orderId: string;
    referenceCode: string;
    items: Array<{ name: string; selectedSize: string; quantity: number; basePrice: number; images: string[] }>;
    total: number;
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    resellerName: string;
    paymentMethod: string;
  } | null;
  setLastOrder: (order: CartStore['lastOrder']) => void;
  clearLastOrder: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      appliedCoupon: null,
      resellerWhatsApp: null,
      cartStep: 'items',
      stockAlerts: {},
      lastOrder: null,

      setLastOrder: (order) => set({ lastOrder: order }),
      clearLastOrder: () => set({ lastOrder: null }),

      initRealtimeSubscription: () => {
        const { items } = get();
        if (items.length === 0) return;
        const productIds = items.map(i => i.id);

        repo.subscribeToStockChanges(productIds, (payload) => {
          const updatedProduct = payload.new;
          if (updatedProduct) {
            const cartItem = get().items.find(i => i.id === updatedProduct.id);
            if (cartItem && updatedProduct.total_stock < 5) {
              toast.warning(`¡Atención! Quedan pocas unidades de ${cartItem.name}`);
              set((state) => ({ stockAlerts: { ...state.stockAlerts, [cartItem.id]: 'low_stock' } }));
            }
          }
        });
      },

      setResellerWhatsApp: (num) => set({ resellerWhatsApp: num }),
      setCartStep: (step) => set({ cartStep: step }),

      addItem: (product, size, quantity = 1) => {
        const { items } = get();
        const existingItem = items.find(
          (item) => item.id === product.id && item.selectedSize === size
        );

        let newItems;
        if (existingItem) {
          newItems = items.map((item) =>
            item.id === product.id && item.selectedSize === size
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          newItems = [...items, { ...product, selectedSize: size, quantity }];
        }

        set({ items: newItems });
        syncWithDB(newItems);
      },

      removeItem: (productId, size) => {
        const newItems = get().items.filter(
          (item) => !(item.id === productId && item.selectedSize === size)
        );
        set({ items: newItems });
        syncWithDB(newItems);
      },

      updateQuantity: (productId, size, quantity) => {
        if (quantity < 1) return;
        const newItems = get().items.map((item) =>
          item.id === productId && item.selectedSize === size
            ? { ...item, quantity }
            : item
        );
        set({ items: newItems });
        syncWithDB(newItems);
      },

      clearCart: () => {
        set({ items: [], appliedCoupon: null });
        syncWithDB([]);
      },

      toggleCart: () => set({ isOpen: !get().isOpen }),
      setIsOpen: (open) => set({ isOpen: open }),

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + (item.basePrice || 0) * item.quantity,
          0
        );
      },

      getDiscountAmount: () => {
        const subtotal = get().getSubtotal();
        const coupon = get().appliedCoupon;

        if (!coupon) return 0;

        // Validation of minimum purchase amount
        if (subtotal < (coupon.min_purchase_amount || 0)) {
          return 0;
        }

        if (coupon.discount_type === 'percentage') {
          return (subtotal * coupon.discount_value) / 100;
        } else {
          return coupon.discount_value;
        }
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const discount = get().getDiscountAmount();
        return Math.max(0, subtotal - discount);
      },

      applyCoupon: (coupon) => set({ appliedCoupon: coupon }),

      removeCoupon: () => set({ appliedCoupon: null }),
    }),
    {
      name: 'eter-cart-storage',
    }
  )
);

