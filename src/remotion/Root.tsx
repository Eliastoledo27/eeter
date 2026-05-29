import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { ProductPromoVideo } from './ProductPromoVideo';

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="ProductPromo"
                component={ProductPromoVideo as any}
                durationInFrames={150} // 5 seconds at 30 fps
                fps={30}
                width={1080}
                height={1920} // Instagram/WhatsApp Stories format (9:16)
                schema={undefined} // Can be extended with a zod schema if desired
                defaultProps={{
                    productName: "ÉTER CYBER OVERSIZED T-SHIRT",
                    productPrice: "$28,500",
                    productImage: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800",
                    brandAccent: "#00E5FF",
                    resellerName: "ÉTER STORE",
                    slogan: "EXCLUSIVA COLECCION 2026",
                    showScanlines: true,
                    glowIntensity: 3,
                }}
            />
        </>
    );
};

registerRoot(RemotionRoot);

export default RemotionRoot;
