import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types';
import { Coupon } from '@/app/actions/coupons';

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
  cartStep: 'items' | 'checkout' | 'success';
  setCartStep: (step: 'items' | 'checkout' | 'success') => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      appliedCoupon: null,
      resellerWhatsApp: null,
      cartStep: 'items',

      setResellerWhatsApp: (num) => set({ resellerWhatsApp: num }),
      setCartStep: (step) => set({ cartStep: step }),

      addItem: (product, size, quantity = 1) => {
        const { items } = get();
        const existingItem = items.find(
          (item) => item.id === product.id && item.selectedSize === size
        );

        if (existingItem) {
          set({
            items: items.map((item) =>
              item.id === product.id && item.selectedSize === size
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          set({
            items: [...items, { ...product, selectedSize: size, quantity }],
          });
        }
      },

      removeItem: (productId, size) => {
        set({
          items: get().items.filter(
            (item) => !(item.id === productId && item.selectedSize === size)
          ),
        });
      },

      updateQuantity: (productId, size, quantity) => {
        if (quantity < 1) return;
        set({
          items: get().items.map((item) =>
            item.id === productId && item.selectedSize === size
              ? { ...item, quantity }
              : item
          ),
        });
      },

      clearCart: () => set({ items: [], appliedCoupon: null }),

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

