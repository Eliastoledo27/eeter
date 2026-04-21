'use client';

import { useEffect, useState } from 'react';
import { SplashScreen } from '@/components/home/SplashScreen';
import LandingPage from '@/components/landing/LandingPage';

export function HomeDecision() {
    const [showSplash, setShowSplash] = useState<boolean | null>(null);

    useEffect(() => {
        // Obtenemos la fecha actual en formato local
        const today = new Date().toLocaleDateString('es-AR');
        const splashSeen = localStorage.getItem('eter_splash_seen_date');
        const justRedirected = sessionStorage.getItem('eter_just_redirected');

        // Si el usuario acaba de ser redirigido por el splash, y luego hace click en "Inicio"
        // o toca el logo para volver a la raíz, no queremos mostrarle el splash de nuevo.
        // O si ya vio el splash en el día de hoy, le mostramos el index real.
        if (splashSeen === today || justRedirected === 'true') {
            setShowSplash(false);
            // Marcamos que ya no acaba de ser redirigido para flujos posteriores
            sessionStorage.removeItem('eter_just_redirected');
        } else {
            // Es la primera vez en el día
            localStorage.setItem('eter_splash_seen_date', today);
            sessionStorage.setItem('eter_just_redirected', 'true');
            setShowSplash(true);
        }
    }, []);

    // Durante el chequeo (apenas milisegundos), mostramos fondo negro para evitar destellos blancos
    if (showSplash === null) {
        return <div className="min-h-screen bg-[#050505]" />;
    }

    if (showSplash) {
        return <SplashScreen />;
    }

    // Si ya vio el splash hoy o regresó usando navegación/botones, mostramos la verdadera Landing Page
    return <LandingPage />;
}
