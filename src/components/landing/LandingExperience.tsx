'use client';

import * as React from 'react';
import { PreviewHeader } from '@/components/landing/primitives/PreviewHeader';
import { Scene01_Hero } from '@/components/landing/scenes/Scene01_Hero';
import { SceneTheBest } from '@/components/landing/scenes/SceneTheBest';
import { SceneEcosystem } from '@/components/landing/scenes/SceneEcosystem';
import { SceneCommunityReferences } from '@/components/landing/scenes/SceneCommunityReferences';
import { Scene04_WhyEter } from '@/components/landing/scenes/Scene04_WhyEter';
import { SceneBrandBanner } from '@/components/landing/scenes/SceneBrandBanner';
import { PreviewFooter } from '@/components/landing/primitives/PreviewFooter';
import { CrossedKineticRibbons } from '@/components/landing/primitives/CrossedKineticRibbons';
import { Product } from '@/domain/entities/Product';

export interface LandingExperienceProps {
    products?: Product[];
    className?: string;
}

/**
 * LandingExperience (Arquitectura Modular ÉTER V2)
 * Orquestador de escenas cinematográficas y transiciones de alto impacto.
 * 
 * Flujo narrativo:
 * - LÍNEAS LATERALES NEÓN VERDE
 * - HEADER FIJO CON BLUR AL SCROLL
 * - HERO MONUMENTAL
 * - CINTAS VERDES NEÓN 01
 * - THE BEST (Showcase de Calzado y Productos)
 * - ECOSISTEMA ÉTER: LO QUE HACEMOS
 * - CINTAS VERDES NEÓN 02
 * - COMUNIDAD & REFERENCIAS (Prueba Social y Casos de Éxito)
 * - POR QUÉ ÉTER
 * - BANNER ATMOSFÉRICO DE MARCA (Laboratorio / Brand Banner)
 * - FOOTER MINIMALISTA & PROFESIONAL
 */
export function LandingExperience({ products, className }: LandingExperienceProps) {
    return (
        <div className={`relative w-full bg-[#050505] text-white selection:bg-[#39FF14] selection:text-black overflow-hidden ${className || ''}`}>
            
            {/* LÍNEAS LATERALES VERDE NEÓN FINAS */}
            <div
                aria-hidden="true"
                className="fixed top-0 bottom-0 left-0 w-[1.5px] bg-[#39FF14] shadow-[0_0_8px_#39FF14,0_0_15px_rgba(57,255,20,0.5)] z-40 pointer-events-none opacity-80"
            />
            <div
                aria-hidden="true"
                className="fixed top-0 bottom-0 right-0 w-[1.5px] bg-[#39FF14] shadow-[0_0_8px_#39FF14,0_0_15px_rgba(57,255,20,0.5)] z-40 pointer-events-none opacity-80"
            />

            {/* 1. HEADER FIJO CON BLUR AL SCROLL */}
            <PreviewHeader />

            {/* 2. ESCENA 01: HERO MONUMENTAL */}
            <Scene01_Hero />

            {/* 3. CINTAS CINÉTICAS CRUZADAS 01 (VERDE NEÓN) */}
            <CrossedKineticRibbons
                primaryText="ÉTER STORE"
                secondaryText="CALZADO URBANO BRASIL"
            />

            {/* 4. ESCENA — THE BEST: PRODUCT SHOWCASE */}
            <SceneTheBest products={products} />

            {/* 5. ESCENA — ECOSISTEMA ÉTER: LO QUE HACEMOS */}
            <SceneEcosystem />

            {/* 6. CINTAS CINÉTICAS CRUZADAS 02 (VERDE NEÓN) */}
            <CrossedKineticRibbons
                primaryText="EN LA CALLE · COMUNIDAD ÉTER"
                secondaryText="CLIENTES · REVENDEDORES · ENVÍOS REALES"
            />

            {/* 7. ESCENA — COMUNIDAD & REFERENCIAS: PRUEBA SOCIAL & CASOS REALES */}
            <SceneCommunityReferences />

            {/* 8. ESCENA — POR QUÉ ÉTER (AUTORIDAD OPERATIVA) */}
            <Scene04_WhyEter />

            {/* 9. BANNER ATMOSFÉRICO DE MARCA (LABORATORIO) */}
            <SceneBrandBanner />

            {/* 10. FOOTER MINIMALISTA Y PROFESIONAL */}
            <PreviewFooter />
            
        </div>
    );
}

export default LandingExperience;
