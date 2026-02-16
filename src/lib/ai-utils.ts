import { toast } from 'sonner';

export const analyzeImageWithName = async (imageUrl: string, geminiApiKey: string): Promise<string | null> => {
    if (!geminiApiKey) {
        toast.error('Configura tu API Key de Gemini primero.');
        return null;
    }

    try {
        // 1. Fetch the image and convert to base64
        const responseImage = await fetch(imageUrl);
        const blob = await responseImage.blob();

        const base64Promise = new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = (reader.result as string).split(',')[1];
                resolve(base64String);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });

        const base64Data = await base64Promise;

        // 2. Call Gemini
        const prompt = "Analiza esta imagen de calzado y dime un nombre real, comercial y atractivo para este modelo. Responde únicamente con el nombre, sin puntos finales ni texto adicional. Ejemplos: Nike Air Max 270, Éter Quantum Ultra, Adidas Ultraboost V4.";

        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: prompt },
                        {
                            inline_data: {
                                mime_type: blob.type,
                                data: base64Data
                            }
                        }
                    ]
                }]
            })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message || 'Error en Gemini API');

        const result = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        return result || null;

    } catch (err) {
        console.error('AI Analysis Error:', err);
        toast.error('Error al analizar la imagen con IA');
        return null;
    }
};
