'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/store/cart-store';

export function ResellerCartInitializer({ whatsappNumber }: { whatsappNumber: string | null }) {
    const setResellerWhatsApp = useCartStore(state => state.setResellerWhatsApp);

    useEffect(() => {
        setResellerWhatsApp(whatsappNumber);

        // Clean up when leaving the reseller area? 
        // Actually, it's better to keep it as long as they are in the session, 
        // but if they go back to main site, it should probably be cleared.
        // For now, let's keep it simple.
    }, [whatsappNumber, setResellerWhatsApp]);

    return null;
}
