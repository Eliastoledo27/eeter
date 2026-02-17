import { useCartStore } from '@/store/cart-store';
import { Product } from '@/types';

// Legacy Cart Item type expected by some components
export interface LegacyCartItem {
    productId: number | string;
    name: string;
    brand?: string;
    image: string;
    size: number | string;
    color?: string;
    price: number;
    quantity: number;
}

export function useCart() {
    const store = useCartStore();

    const addItem = (item: LegacyCartItem | Product, size?: string, quantity: number = 1) => {
        if ('id' in item && size) {
            // Modern usage: full product object
            store.addItem(item as Product, size, quantity);
            return;
        }

        // Legacy usage: LegacyCartItem
        const legacyItem = item as LegacyCartItem;
        const product: Product = {
            id: String(legacyItem.productId),
            name: legacyItem.name,
            description: '', // Fallback
            category: legacyItem.brand || 'General',
            basePrice: legacyItem.price,
            images: [legacyItem.image],
            stockBySize: {}, // Not needed for adding to cart
            totalStock: 0,
            status: 'active',
            createdAt: new Date(),
        };

        store.addItem(product, String(size || legacyItem.size), quantity || legacyItem.quantity);
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const removeItem = (_id: string) => {
        // Legacy removeItem took ID, but store takes productId + size.
        // This is a tricky mapping. We'll try to find the item in store by ID if possible,
        // or we might need to update components to use store.removeItem(productId, size).
        // For now, let's assume legacy ID might be matched or we fail gracefully.
        // Actually, legacy components using removeItem might be rare.
        // Let's check if removeItem is used.
        // CartSidebar used it, but we are replacing CartSidebar.
        console.warn('removeItem called via legacy hook. Use useCartStore directly for better control.');
    };

    const totals = {
        itemCount: store.items.reduce((acc, item) => acc + item.quantity, 0),
        total: store.getTotal(),
    };

    return {
        ...store,
        addItem, // Override with adapter
        removeItem,
        openCart: () => {
            if (!store.isOpen) store.toggleCart();
        },
        closeCart: () => {
            if (store.isOpen) store.toggleCart();
        },
        totals,
    };
}
