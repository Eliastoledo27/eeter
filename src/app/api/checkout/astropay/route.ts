import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Simulate AstroPay link generation - March 2026 integration
        const mockAstroPayUrl = `https://app.astropay.com/checkout/mock-${Date.now()}`;

        return NextResponse.json({
            success: true,
            init_point: mockAstroPayUrl,
            id: `AP-${Date.now()}`
        });
    } catch (error) {
        console.error("AstroPay Error:", error);
        return NextResponse.json(
            { success: false, error: "Error interno del servidor AstroPay" },
            { status: 500 }
        );
    }
}
