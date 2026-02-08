const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const destDir = 'hostinger-deploy';

function copyDir(src, dest) {
    if (!fs.existsSync(src)) return;
    fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

console.log('🚀 Preparando archivos para Hostinger...');

// 1. Limpiar directorio destino
if (fs.existsSync(destDir)) {
    console.log('🧹 Limpiando carpeta anterior...');
    fs.rmSync(destDir, { recursive: true, force: true });
}
fs.mkdirSync(destDir);

// 2. Ejecutar build (si no existe .next/standalone o se fuerza)
// Mejor asumimos que el usuario ya corrió build o lo corremos
if (!fs.existsSync('.next/standalone')) {
    console.log('🏗️ Ejecutando build...');
    try {
        execSync('npm run build', { stdio: 'inherit' });
    } catch (e) {
        console.error('❌ Error en build. Corrige errores antes de desplegar.');
        process.exit(1);
    }
}

// 3. Copiar Standalone (base)
console.log('📂 Copiando archivos del servidor (standalone)...');
copyDir('.next/standalone', destDir);

// 4. Copiar Public
console.log('🖼️ Copiando carpeta public...');
copyDir('public', path.join(destDir, 'public'));

// 5. Copiar Static (.next/static -> .next/static)
console.log('⚡ Copiando archivos estáticos (.next/static)...');
copyDir('.next/static', path.join(destDir, '.next/static'));

// 6. Crear server.js de entrada compatible con Hostinger/cPanel
const serverJsContent = `
const path = require('path')
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

// Conf for standalone mode
const app = next({ dev, hostname, port, dir: __dirname })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(\`> Ready on http://\${hostname}:\${port}\`)
    })
})
`;

// Si ya existe server.js en standalone, lo renombramos a _next_server.js y usamos el nuestro como wrapper
// O simplemente confiamos en que standalone server.js funciona. Standalone server.js es bueno.
// Pero Hostinger a veces necesita un archivo en la raíz que se llame diferente o que tenga console.logs específicos.
// El server.js de standalone es: .next/standalone/server.js
// Al copiar .next/standalone a destDir, ya tenemos un server.js en la raíz de destDir.

console.log('✅ Archivos listos en folder "hostinger-deploy".');
console.log('👉 Sube el contenido de "hostinger-deploy" a tu carpeta public_html (o subcarpeta) en Hostinger.');
console.log('👉 En Hostinger Node.js manager:');
console.log('   - Application Root: apunta a donde subiste los archivos.');
console.log('   - Startup File: server.js');
console.log('   - Run npm install (aunque standalone ya trae node_modules, a veces hace falta reinstalar si la arquitectura difiere).');
console.log('   - Start App.');
