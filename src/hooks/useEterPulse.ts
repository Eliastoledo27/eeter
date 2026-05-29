
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
    const isFirstRun = useRef<{ [key in PulseChannel]: boolean }>({
        SALES: true,
        LOCAL_DELIVERY: true,
        NATIONAL_SHIPMENT: true
    });

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

        // First run initial delays (5s for SALES, 20s for SHIPMENT, 45s for DELIVERY)
        if (isFirstRun.current[channel]) {
            isFirstRun.current[channel] = false;
            if (channel === 'SALES') {
                delay = 5000;
            } else if (channel === 'NATIONAL_SHIPMENT') {
                delay = 20000;
            } else {
                delay = 45000;
            }
        } else {
            // Subsequent runs - regular realistic delays (faster for active visual feedback)
            if (channel === 'SALES') {
                // Random between 45 seconds and 3 minutes
                delay = (Math.floor(Math.random() * (180 - 45 + 1)) + 45) * 1000;
            } else if (channel === 'LOCAL_DELIVERY') {
                // Random between 4 minutes and 10 minutes
                delay = (Math.floor(Math.random() * (600 - 240 + 1)) + 240) * 1000;
            } else if (channel === 'NATIONAL_SHIPMENT') {
                // Random between 2 minutes and 6 minutes
                delay = (Math.floor(Math.random() * (360 - 120 + 1)) + 120) * 1000;
            }
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
