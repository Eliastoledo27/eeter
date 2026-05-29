import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure dot env is loaded
import * as dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function generateProductVideo(productId) {
  console.log(`Fetching product ${productId}...`);
  
  let product;
  if (productId) {
    const { data, error } = await supabase.from('productos').select('*').eq('id', productId).single();
    if (error) throw error;
    product = data;
  } else {
    // Fetch a popular product if none specified
    const { data, error } = await supabase.from('productos').select('*').eq('status', 'activo').limit(1);
    if (error) throw error;
    product = data[0];
  }

  if (!product) {
    console.error("No product found.");
    return;
  }

  console.log(`Product found: ${product.name} - $${product.price}`);

  // Create a customized index.html for HyperFrames
  const videoDir = path.join(__dirname, '..', 'eter-videos');
  
  // Create a template that showcases the product
  const htmlContent = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <title>ETER - ${product.name}</title>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;800;900&display=block" rel="stylesheet" />
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body, html { width: 1920px; height: 1080px; overflow: hidden; background: #050505; font-family: "Inter", sans-serif; color: white; }
      .scene { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
      .neon-cyan { text-shadow: 0 0 10px rgba(0,229,255,0.5), 0 0 20px rgba(0,229,255,0.3); }
    </style>
    <script>
      // Inject product data
      window.PRODUCT_DATA = ${JSON.stringify(product)};
    </script>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="6" data-width="1920" data-height="1080">
      
      <div id="scene-bg" class="scene flex items-center justify-center">
        <div class="absolute inset-0 bg-gradient-to-tr from-black via-[#0a0a0f] to-[#001520]"></div>
        <div class="absolute w-[800px] h-[800px] bg-[#00E5FF] rounded-full blur-[150px] opacity-10" id="glow"></div>
      </div>

      <div id="product-scene" class="scene flex items-center justify-between px-32">
        <div class="w-1/2 flex flex-col justify-center">
          <div id="brand-tag" class="text-[#00E5FF] font-black tracking-[0.3em] uppercase text-xl mb-4 opacity-0 transform -translate-y-4">ÉTER EXCLUSIVE</div>
          <h1 id="product-name" class="text-8xl font-black uppercase leading-tight mb-8 opacity-0 transform -translate-x-10">${product.name}</h1>
          <div id="product-price" class="text-6xl font-bold text-white/90 opacity-0 transform translate-y-4">$${product.price}</div>
          
          <div id="features" class="mt-12 flex gap-6 opacity-0">
            <div class="px-6 py-3 border border-white/10 bg-white/5 backdrop-blur-md rounded-full text-lg uppercase tracking-widest font-bold">PREMIUM</div>
            <div class="px-6 py-3 border border-[#00E5FF]/30 bg-[#00E5FF]/10 text-[#00E5FF] backdrop-blur-md rounded-full text-lg uppercase tracking-widest font-bold">STOCK LIMITADO</div>
          </div>
        </div>
        
        <div class="w-1/2 flex items-center justify-center relative">
          <div id="image-container" class="relative w-[700px] h-[700px] opacity-0 transform scale-90 rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,229,255,0.1)]">
            <img src="${product.images[0] || 'https://placehold.co/800x800/111/fff?text=ETER'}" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          </div>
        </div>
      </div>

    </div>

    <script>
      window.__timelines = window.__timelines || {};
      const mainTl = gsap.timeline({ paused: true });

      // Animations
      mainTl.to("#glow", { scale: 1.2, opacity: 0.2, duration: 2, ease: "power2.out" }, 0);
      mainTl.to("#brand-tag", { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, 0.5);
      mainTl.to("#product-name", { opacity: 1, x: 0, duration: 1, ease: "expo.out" }, 0.7);
      mainTl.to("#product-price", { opacity: 1, y: 0, duration: 0.8, ease: "back.out(1.5)" }, 1.0);
      mainTl.to("#features", { opacity: 1, duration: 0.8, ease: "power2.out" }, 1.3);
      
      mainTl.to("#image-container", { opacity: 1, scale: 1, rotation: 2, duration: 1.5, ease: "expo.out" }, 0.8);
      
      // Floating animation for image
      mainTl.to("#image-container", { y: -20, duration: 2, ease: "sine.inOut", yoyo: true, repeat: -1 }, 2.3);

      // Outro
      mainTl.to("#product-scene", { opacity: 0, scale: 0.95, filter: "blur(10px)", duration: 1, ease: "power2.inOut" }, 5.0);

      window.__timelines["main"] = mainTl;
    </script>
  </body>
</html>`;

  const indexPath = path.join(videoDir, 'index.html');
  fs.writeFileSync(indexPath, htmlContent, 'utf-8');
  console.log('Template generated at eter-videos/index.html');

  // Render the video
  console.log('Rendering video via HyperFrames CLI...');
  try {
    execSync('npm run render', { cwd: videoDir, stdio: 'inherit' });
    console.log(`Video rendered successfully for product: ${product.name}`);
  } catch (error) {
    console.error('Failed to render video:', error.message);
  }
}

const productId = process.argv[2];
generateProductVideo(productId);
