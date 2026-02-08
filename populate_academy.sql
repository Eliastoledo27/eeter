-- Use this script to populate the Academy with more VIP content
-- Run this in your Supabase SQL Editor

INSERT INTO public.academy_content (title, type, url, description, is_vip, thumbnail_url)
VALUES 
(
  'Estrategias de Venta en Instagram', 
  'video', 
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 
  'Domina el algoritmo y convierte seguidores en compradores fieles con estas estrategias probadas.', 
  true,
  'https://images.unsplash.com/photo-1611162617474-5b21e879e113?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
),
(
  'Guía Definitiva de Facebook Ads', 
  'pdf', 
  'https://example.com/fb-ads.pdf', 
  'Manual paso a paso para crear campañas publicitarias rentables desde cero.', 
  true,
  NULL
),
(
  'Podcast: Entrevista con el Top Seller del Mes', 
  'audio', 
  'https://example.com/interview.mp3', 
  'Secretos, rutinas y mentalidad de quien facturó más de $10,000 este mes.', 
  true,
  NULL
),
(
  'Copywriting para Vender Sneakers', 
  'video', 
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 
  'Aprende a escribir descripciones que despierten el deseo de compra irresistible.', 
  false,
  'https://images.unsplash.com/photo-1455390582262-044cdead277a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
),
(
  'Kit de Marketing: Plantillas Editables', 
  'pdf', 
  'https://example.com/kit.zip', 
  'Pack de diseños en Canva listos para usar en tus historias y posts.', 
  true,
  NULL
);
