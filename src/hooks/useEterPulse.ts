
'use client';

import { useEffect, useCallback, useRef } from 'react';
import { usePulseStore } from '@/store/pulse-store';
import { PulseChannel, PulseEvent } from '@/types/pulse';
import { PULSE_CITIES, NATIONAL_CITIES, SNEAKER_MODELS } from '@/lib/pulse-data';
import { useAudio } from '@/providers/AudioProvider';

export function useEterPulse(onNewEvent?: (event: PulseEvent) => void) {
    const addEvent = usePulseStore(state => state.addEvent);
    const { playAuraNotification } = useAudio();
    
    // Refs to manage intervals autonomously
    const timersRef = useRef<{ [key in PulseChannel]?: NodeJS.Timeout }>({});

    const isWithinHours = (start: string, end: string) => {
        const now = new Date();
        const currentHour = now.getHours() + now.getMinutes() / 60;
        
        const [startH, startM] = start.split(':').map(Number);
        const [endH, endM] = end.split(':').map(Number);
        
        const startVal = startH + (startM || 0) / 60;
        const endVal = endH + (endM || 0) / 60;

        if (startVal < endVal) {
            return currentHour >= startVal && currentHour < endVal;
        } else {
            // Handle overnight hours (e.g., 08:30 to 02:00)
            return currentHour >= startVal || currentHour < endVal;
        }
    };

    const generateRandomEvent = useCallback((channel: PulseChannel): PulseEvent => {
        const id = Math.random().toString(36).substring(2, 11);
        const model = SNEAKER_MODELS[Math.floor(Math.random() * SNEAKER_MODELS.length)];
        let city = "";

        if (channel === 'LOCAL_DELIVERY') {
            city = "Mar del Plata";
        } else if (channel === 'NATIONAL_SHIPMENT') {
            city = NATIONAL_CITIES[Math.floor(Math.random() * NATIONAL_CITIES.length)];
        } else {
            city = PULSE_CITIES[Math.floor(Math.random() * PULSE_CITIES.length)];
        }

        return {
            id,
            channel,
            city,
            model,
            timestamp: Date.now()
        };
    }, []);

    const scheduleNext = useCallback((channel: PulseChannel) => {
        // Clear previous timer if any
        if (timersRef.current[channel]) {
            clearTimeout(timersRef.current[channel]);
        }

        let delay = 0;
        let active = false;

        const now = new Date();
        const hour = now.getHours();

        if (channel === 'SALES') {
            active = isWithinHours("08:30", "02:00");
            // Random between 10 and 45 min (in ms)
            // Low intensity after 22:00 (increase delay)
            const min = hour >= 22 || hour < 2 ? 30 : 10;
            const max = hour >= 22 || hour < 2 ? 60 : 45;
            delay = (Math.floor(Math.random() * (max - min + 1)) + min) * 60 * 1000;
        } else if (channel === 'LOCAL_DELIVERY') {
            active = isWithinHours("09:00", "18:00");
            delay = (Math.floor(Math.random() * (120 - 40 + 1)) + 40) * 60 * 1000; // MDQ deliveries are less frequent
        } else if (channel === 'NATIONAL_SHIPMENT') {
            active = isWithinHours("09:00", "18:00");
            delay = (Math.floor(Math.random() * (90 - 30 + 1)) + 30) * 60 * 1000;
        }

        if (!active) {
            // Check again in 15 minutes if it's within hours
            timersRef.current[channel] = setTimeout(() => scheduleNext(channel), 15 * 60 * 1000);
            return;
        }

        timersRef.current[channel] = setTimeout(() => {
            const event = generateRandomEvent(channel);
            addEvent(event);
            playAuraNotification(); // playAuraNotification wrapper
            if (onNewEvent) onNewEvent(event);
            
            // Schedule next one
            scheduleNext(channel);
        }, delay);
    }, [addEvent, generateRandomEvent, onNewEvent, playAuraNotification]);

    useEffect(() => {
        // Start timers on mount
        scheduleNext('SALES');
        scheduleNext('LOCAL_DELIVERY');
        scheduleNext('NATIONAL_SHIPMENT');

        return () => {
            // Cleanup timers on unmount
            Object.values(timersRef.current).forEach(t => t && clearTimeout(t));
        };
    }, [scheduleNext]);

    return {
        // Current logic is autonomous, but we could return state if needed
    };
}
