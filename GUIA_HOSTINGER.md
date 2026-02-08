# Guía de Despliegue en Hostinger (Node.js)

Hemos adaptado tu proyecto para que funcione correctamente en Hostinger utilizando la funcionalidad de **Node.js**.

## Archivos Preparados
1. **`server.js`**: Archivo de arranque creado específicamente para Hostinger.
2. **`next.config.mjs`**: Configurado en modo `standalone` para optimizar el rendimiento.
3. **`.env.production`**: Variables de entorno configuradas para producción (sin modo dev).

## Pasos para Subir

### 1. Preparar los Archivos
No subas todo tal cual. Lo ideal es subir el código fuente limpio.
**NO SUBAS** las siguientes carpetas:
- ❌ `node_modules` (Se instalarán en el servidor automáticamente)
- ❌ `.next` (Se generará en el servidor)
- ❌ `.git`

**SÍ SUBE** todo lo demás, incluyendo:
- ✅ `src/`
- ✅ `public/`
- ✅ `package.json`
- ✅ `next.config.mjs`
- ✅ `server.js`
- ✅ `.env.production` (Puedes renombrarlo a `.env` en el servidor si es necesario)

### 2. Configurar en Hostinger (hPanel)
1. Ve a tu panel de Hostinger.
2. Busca la sección **Avanzado** o **Sitio Web** y haz clic en **Node.js** (si no lo ves, contacta a soporte para verificar si tu plan lo incluye).
3. Crea una nueva aplicación:
   - **Versión de Node.js**: Elige la 18 o 20 (Recomendado >= 18.17.0 según tu package.json).
   - **Modo de aplicación**: Producción.
   - **Raíz del documento**: `public_html` (o la carpeta donde subirás los archivos).
   - **Archivo de inicio de la aplicación**: `server.js` (¡Muy importante!).

### 3. Subir Archivos
1. Usa el **Administrador de Archivos** o **FTP**.
2. Sube los archivos preparados a la carpeta raíz de tu aplicación (ej. `public_html`).

### 4. Instalar Dependencias y Construir
1. En la pantalla de configuración de Node.js en Hostinger, haz clic en el botón **NPM Install**. Esto creará la carpeta `node_modules` correctamente para Linux.
2. Una vez instalado, necesitas construir la aplicación ("Build").
   - Hostinger a veces permite ejecutar comandos personalizados. Debes ejecutar: `npm run build`.
   - **Truco**: Si no puedes ejecutar `build` desde el panel, puedes cambiar temporalmente el comando de "Run" en `package.json` o usar la consola SSH si tienes acceso.
   - O bien, usa la sección de "Comandos NPM" en la interfaz y escribe `build` y dale a ejecutar.

### 5. Iniciar la App
1. Una vez construido (debe aparecer la carpeta `.next`), haz clic en **Reiniciar** o **Start** en el panel de Node.js.
2. ¡Tu aplicación debería estar en línea!

## Solución de Problemas Comunes
- **Error 403/404**: Asegúrate de que el archivo de inicio sea `server.js` y no `app.js` u otro por defecto.
- **Error de Imágenes**: Si las imágenes no cargan, verifica que `sharp` se instaló correctamente (al hacer NPM Install en el servidor).
- **Estilos rotos**: Asegúrate de que la carpeta `.next` se haya creado tras el build.

## Preguntas Frecuentes
### ¿Necesito crear un archivo index.php o default.php?
**NO**. Tu aplicación es moderna y usa **Node.js**, no PHP.
- En el mundo antiguo (PHP), el servidor buscaba `index.php`.
- En tu nueva App (Next.js), el servidor usa `server.js` para arrancar.
- Tener un archivo `.php` ahí solo causará conflictos. **Bórralos**.

---
**Nota Importante**: Si tu plan de hosting NO tiene la opción de Node.js (solo PHP), esta aplicación Next.js NO funcionará completa (perderás el carrito, login, etc.). En ese caso necesitarías un plan VPS.
