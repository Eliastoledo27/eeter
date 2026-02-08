'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function initializeProductSizes() {
    const supabase = createClient();
    
    // Default sizes for shoes (Pegada Solo context)
    const defaultSizes = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];
    
    try {
        const { data: products, error } = await supabase
            .from('productos')
            .select('id, stock_by_size');

        if (error) throw error;

        let updatedCount = 0;

        for (const product of products) {
            const currentStock = (product.stock_by_size as Record<string, number>) || {};
            let needsUpdate = false;
            const newStock = { ...currentStock };

            // Check if it has the "Unique" key or is empty
            const keys = Object.keys(currentStock);
            if (keys.length === 0 || (keys.length === 1 && keys[0] === 'Unique')) {
                // Remove Unique if exists
                if (newStock['Unique']) delete newStock['Unique'];
                
                // Add default sizes with 0 stock if they don't exist
                defaultSizes.forEach(size => {
                    if (newStock[size] === undefined) {
                        newStock[size] = 0;
                    }
                });
                needsUpdate = true;
            } else {
                // Even if it has some sizes, ensure all default sizes exist (user said "add default sizes to all")
                defaultSizes.forEach(size => {
                    if (newStock[size] === undefined) {
                        newStock[size] = 0;
                        needsUpdate = true;
                    }
                });
            }

            if (needsUpdate) {
                const { error: updateError } = await supabase
                    .from('productos')
                    .update({ stock_by_size: newStock })
                    .eq('id', product.id);
                
                if (!updateError) {
                    updatedCount++;
                }
            }
        }

        revalidatePath('/dashboard/products');
        revalidatePath('/catalog');
        
        return { success: true, count: updatedCount };
    } catch (error) {
        console.error('Migration error:', error);
        return { success: false, error: 'Failed to migrate products' };
    }
}
