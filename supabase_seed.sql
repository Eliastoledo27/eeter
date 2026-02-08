-- PRODUCTOS (SNEAKERS & ACCESORIOS PREMIUM)
INSERT INTO public.products (name, description, category, base_price, images, stock_by_size)
VALUES 
(
  'Éter Phantom Black', 
  'Sneakers de diseño minimalista con acabado negro mate y suela translúcida. Ideales para un look urbano sofisticado.', 
  'Sneakers', 
  120.00, 
  ARRAY['https://images.unsplash.com/photo-1491553895911-0055eca6402d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], 
  '{"40": 5, "41": 10, "42": 8, "43": 2}'::jsonb
),
(
  'Aero Gold Runner', 
  'Tecnología de amortiguación superior con detalles en oro real de 18k. Edición limitada para coleccionistas.', 
  'Sneakers', 
  180.50, 
  ARRAY['https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], 
  '{"39": 2, "40": 5, "41": 0, "42": 4}'::jsonb
),
(
  'Midnight Hoodie', 
  'Sudadera oversized de algodón egipcio de alto gramaje. Confort absoluto con estilo dark luxury.', 
  'Apparel', 
  85.00, 
  ARRAY['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], 
  '{"S": 10, "M": 15, "L": 10}'::jsonb
);

-- CONTENIDO ACADEMIA (LMS)
INSERT INTO public.academy_content (title, type, url, description, is_vip, thumbnail_url)
VALUES 
(
  'Bienvenida a Éter: Tu Primer Venta', 
  'video', 
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 
  'Descubre los fundamentos de nuestra plataforma y cómo generar tus primeros ingresos en menos de 24 horas.', 
  false,
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
),
(
  'Masterclass: Psicología del Consumidor de Lujo', 
  'video', 
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 
  'Aprende a vender valor, no precio. Técnicas avanzadas de persuasión para clientes high-ticket.', 
  true,
  'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
),
(
  'Guía de Tallas y Materiales (PDF)', 
  'pdf', 
  'https://example.com/guia.pdf', 
  'Documento técnico para resolver dudas de clientes sobre el calce y los materiales de nuestros sneakers.', 
  false,
  NULL
),
(
  'Audio: Mindset de Ganador', 
  'audio', 
  'https://example.com/audio.mp3', 
  'Reprograma tu mente para el éxito con este audio de 15 minutos para escuchar cada mañana.', 
  true,
  NULL
);

-- LOGROS
INSERT INTO public.achievements (title, description, icon_name, points_required)
VALUES 
('Primera Venta', 'Realiza tu primera venta confirmada.', 'Award', 50),
('Racha de Fuego', 'Mantén una racha de ventas por 7 días consecutivos.', 'Flame', 200),
('Club del Millón', 'Genera más de $1,000 en ventas totales.', 'Crown', 1000);
