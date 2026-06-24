'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/store/cart-store';

export function ResellerCartInitializer({ whatsappNumber, resellerTheme }: { whatsappNumber: string | null; resellerTheme?: string }) {
    const setResellerWhatsApp = useCartStore(state => state.setResellerWhatsApp);
    const setResellerTheme = useCartStore(state => state.setResellerTheme);

    useEffect(() => {
        setResellerWhatsApp(whatsappNumber);
        if (resellerTheme) {
            setResellerTheme(resellerTheme);
        }
    }, [whatsappNumber, resellerTheme, setResellerWhatsApp, setResellerTheme]);

    return null;
}
