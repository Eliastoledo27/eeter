
export type PulseChannel = 'SALES' | 'LOCAL_DELIVERY' | 'NATIONAL_SHIPMENT';

export interface PulseEvent {
    id: string;
    channel: PulseChannel;
    city: string;
    model: string;
    timestamp: number;
}
