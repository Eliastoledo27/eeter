# Notas para subir a Gemini

## Que adjuntar primero

Subi en este orden:

1. `00_README_PARA_GEMINI.md`
2. `01_MASTER_CONTEXT_ETER.md`
3. `02_BRAND_IDENTITY_AND_TONE.md`
4. `03_EXISTING_SITE_STRUCTURE.md`
5. `04_MOBILE_APP_REQUIREMENTS.md`
6. `05_CATALOG_DATA_MODEL.json`
7. `06_RESELLER_SYSTEM_RULES.md`
8. `07_AI_TOOLS_SPEC.md`
9. `08_GOOGLE_INTEGRATIONS_SPEC.md`
10. `09_UI_SCREEN_BLUEPRINTS.md`
11. `10_ASSETS_MANIFEST.json`
12. `11_GEMINI_FINAL_PROMPT.md`

Despues pega el contenido de `11_GEMINI_FINAL_PROMPT.md` como prompt principal.

## Que revisar cuando Gemini genere la app

- Que diga Mar del Plata.
- Que no prometa ganancias.
- Que use margen propio, no comision.
- Que no invente productos.
- Que no ponga claves en frontend.
- Que Gmail solo cree borradores o pida confirmacion antes de enviar.
- Que Drive no borre ni edite sin permiso.
- Que el catalogo tenga estados de carga, vacio y error.
- Que mobile no sea una landing larga sino una app operativa.

## Archivos que no conviene subir a Gemini

- `.env`, `.env.local`, `.env.production`.
- `node_modules`.
- `.next`.
- Videos MP4 pesados.
- Audios MP3 pesados.
- Builds Android.
- Imagenes grandes salvo que quieras usarlas como referencia visual puntual.
- Archivos con claves hardcodeadas.

## Advertencias

Hay una app Android experimental en `MyApplication/` con patrones utiles, pero contiene valores sensibles hardcodeados. No subir ese archivo completo a Gemini sin limpiar secretos.

El catalogo real parece depender de Supabase. Los productos seed/demo no deben publicarse como catalogo vigente sin confirmar.

## Como iterar

Primero pedi a Gemini una version funcional con datos placeholder seguros. Despues pegale el modelo real de Supabase o una exportacion limpia del catalogo. En cada iteracion, pedi que mantenga las reglas de marca y seguridad de este paquete.

