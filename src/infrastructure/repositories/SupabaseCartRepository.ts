import { createClient } from '@/utils/supabase/client';
import { Product } from '@/types';

export interface CartItem extends Product {
    quantity: number;
    selectedSize: string;
}

export class SupabaseCartRepository {
    private supabase = createClient();

    /**
     * Sync local cart items to DB for the authenticated user
     */
    async syncCart(userId: string, items: CartItem[]): Promise<void> {
        try {
            // Create or update cart
            const { data: cartData, error: cartError } = await this.supabase
                .from('carts')
                .upsert({ user_id: userId, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
                .select()
                .single();

            if (cartError) throw cartError;

            const cartId = cartData.id;

            // Delete old items
            await this.supabase.from('cart_items').delete().eq('cart_id', cartId);

            // Insert new items
            if (items.length > 0) {
                const itemsToInsert = items.map(item => ({
                    cart_id: cartId,
                    product_id: item.id,
                    size: item.selectedSize,
                    quantity: item.quantity,
                    price: item.basePrice
                }));

                await this.supabase.from('cart_items').insert(itemsToInsert);
            }
        } catch (err) {
            console.error('Error syncing cart to DB:', err);
        }
    }

    /**
     * Get cart items from DB for the authenticated user
     */
    async getCart(userId: string): Promise<any[]> {
        try {
            const { data, error } = await this.supabase
                .from('carts')
                .select(`
          id,
          cart_items (
            product_id,
            size,
            quantity,
            price
          )
        `)
                .eq('user_id', userId)
                .single();

            if (error || !data) return [];

            return data.cart_items;
        } catch (err) {
            console.error('Error getting cart from DB:', err);
            return [];
        }
    }

    /**
     * Subscribe to stock changes for products in the cart
     */
    subscribeToStockChanges(productIds: string[], onUpdate: (payload: any) => void) {
        if (!productIds || productIds.length === 0) return null;

        // Subscribe to product table changes for specific product IDs
        // Uses Supabase Realtime
        const subscription = this.supabase
            .channel('cart-stock-changes')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'products',
                    filter: `id=in.(${productIds.join(',')})`
                },
                (payload: any) => onUpdate(payload)
            )
            .subscribe();

        return subscription;
    }
}
