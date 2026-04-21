
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PulseEvent } from '@/types/pulse';

interface PulseState {
    events: PulseEvent[];
    addEvent: (event: PulseEvent) => void;
    clearEvents: () => void;
}

export const usePulseStore = create<PulseState>()(
    persist(
        (set) => ({
            events: [],
            addEvent: (event) => set((state) => {
                const newEvents = [event, ...state.events];
                return {
                    events: newEvents.slice(0, 100) // Keep exactly 100 events (LIFO)
                };
            }),
            clearEvents: () => set({ events: [] }),
        }),
        {
            name: 'eter-pulse-registry',
        }
    )
);
