'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/auth-store';

/**
 * AuthInitializer — Client component that initializes auth on mount.
 * Subscribes to Supabase auth state changes and cleans up on unmount.
 * Place this in the root layout (replaces the old AuthProvider).
 */
export function AuthInitializer({ children }: { children: React.ReactNode }) {
    const initialize = useAuthStore((s) => s.initialize);
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        let cleanupFn: (() => void) | undefined;
        let isMounted = true;

        const init = async () => {
            const unsub = await initialize();
            if (isMounted) {
                cleanupFn = unsub;
            } else {
                // Component unmounted locally before init finished, cleanup immediately
                unsub();
            }
        };

        init();

        return () => {
            isMounted = false;
            cleanupFn?.();
        };
    }, [initialize]);

    return <>{children}</>;
}
