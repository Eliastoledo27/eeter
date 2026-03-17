/**
 * Éter Store 2.0 - MDQ Showroom Logistics Engine
 * Showroom Location: Neuquén 700, Mar del Plata
 */

export interface ShippingZone {
    name: string;
    distance: number; // in km
    cost: number;
    neighborhoods: string[];
}

export const SHIPPING_ZONES: ShippingZone[] = [
    {
        name: "Cercano",
        distance: 6,
        cost: 4500,
        neighborhoods: ["Centro", "Puerto", "La Perla", "Terminal", "Varese"]
    },
    {
        name: "Periférico",
        distance: 12,
        cost: 6500,
        neighborhoods: ["Constitución", "Punta Mogotes", "Bosque Peralta Ramos", "Los Troncos"]
    },
    {
        name: "Rural/Extendido",
        distance: 25,
        cost: 8500,
        neighborhoods: ["Batán", "Estación Camet", "Sierra de los Padres", "Santa Clara"]
    }
];

export function calculateShipping(zoneOrNeighborhood: string, itemWeight?: number): { cost: number; estimatedDelivery: string } {
    const searchStr = zoneOrNeighborhood.toLowerCase();

    // Find zone by neighborhood match
    const zone = SHIPPING_ZONES.find(z =>
        z.neighborhoods.some(n => n.toLowerCase().includes(searchStr)) ||
        z.name.toLowerCase().includes(searchStr)
    );

    if (!zone) {
        // Default to Rural if not found within typical city bounds
        return { cost: 9500, estimatedDelivery: "24-48hs" };
    }

    return {
        cost: zone.cost,
        estimatedDelivery: zone.distance <= 6 ? "En el día (Flash)" : "24hs"
    };
}

export function isFreeShipping(itemCount: number): boolean {
    return itemCount >= 2;
}
