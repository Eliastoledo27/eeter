# Master Context ETER

## Que es ETER

ETER Store es un sistema premium de comercio y contenido para calzado urbano, catalogo y revendedores. El proyecto actual esta construido con Next.js, Supabase, Tailwind CSS, IA con Gemini/OpenAI, Remotion/Hyperframes y una app Android experimental llamada FETER Stock.

La marca opera desde Mar del Plata, Argentina. No reemplazar esa ubicacion por "Buenos Aires" como lugar principal de marca. Si se menciona provincia o alcance nacional, hacerlo separado: Mar del Plata + envios a todo el pais.

## Que vende

Principalmente calzado urbano premium, sneakers, modelos de alta rotacion y accesorios/productos relacionados cuando existan en catalogo. El repo contiene ejemplos reales y tambien datos seed/demo. No asumir que todos los productos seed son catalogo comercial vigente.

Categorias detectadas:

- Sneakers
- Running
- Accesorios
- Apparel/indumentaria en ejemplos seed
- Productos demo no comerciales en `src/lib/mock-db.ts`, que no deben tratarse como catalogo real

## Como funciona

ETER funciona como:

- Catalogo publico para compradores.
- Catalogo revendedor con stock visible, filtros por talle, resumen de stock y acciones para compartir.
- Dashboard privado para usuarios, revendedores, soporte y administracion.
- Sistema de gestion de productos, stock, pedidos, mensajes, anuncios, academia y tienda del revendedor.
- Integraciones de IA para descripcion de productos, chat Aura y generacion de anuncios.

## Stock real

Stock real significa que la disponibilidad se calcula desde productos en Supabase, por talle, usando `stock_by_size` y estado activo. No se debe mostrar disponibilidad inventada. Si el dato no esta sincronizado, mostrar "Consultar stock" o "PENDIENTE_DE_CONFIRMAR".

Estados recomendados:

- Disponible: total por talle mayor a 3.
- Ultimas unidades: total bajo.
- Agotado: total 0 o producto inactivo.
- Consultar stock: dato no confiable o no cargado.

## Sistema de revendedores

El sistema no se presenta como comision. Se presenta como margen propio:

ETER pasa un precio base/mayorista. El revendedor decide su precio final. La diferencia es su margen propio.

Flujo:

1. Elegir productos del catalogo.
2. Publicar con precio final propio.
3. Consultar stock antes de cerrar.
4. Tomar datos del cliente.
5. Coordinar entrega o envio.
6. Confirmar forma de pago.
7. Conservar el margen propio.

Datos que se piden para operar una venta:

- Modelo o foto del producto.
- Talle.
- Nombre del cliente.
- Telefono.
- Direccion o zona.
- Forma de pago.

## Reglas comerciales

- No prometer ganancias.
- No prometer stock garantizado.
- No enviar mensajes, emails ni archivos sin confirmacion explicita.
- No decir que es comision como concepto principal.
- No inventar precios ni talles.
- No usar "Buenos Aires" como ubicacion principal de ETER.
- Mantener Mar del Plata como base de identidad.
- Confirmar stock antes de cerrar una venta.
- No exponer API keys, service role keys ni tokens.

## Tono

Directo, simple, seguro, con calle controlada. Profesional pero cercano. Voseo argentino. Sin corporativismo exagerado.

Frases oficiales detectadas:

- Vos vendes. Nosotros respaldamos.
- Vos vendes. Nosotros nos encargamos del resto.
- El que responde primero, vende primero.
- Los precios son mayoristas. Tu ganancia la definis vos.
- Confirma stock antes de cerrar.
- Orden + datos completos = entrega sin problemas.
- Publica hoy. Vende antes.

## Informacion publica y privada

Publica:

- Marca, catalogo publico, productos activos, imagenes, talles disponibles, landing, secciones comerciales, contacto publico.

Privada:

- Dashboard, pedidos, clientes, margenes, ajustes de revendedor, usuarios, perfiles, mensajes, administracion, claves, tokens, service role keys, configuraciones `.env`.

Roles:

- Cliente: ve catalogo, detalle, carrito/checkout o contacto.
- Revendedor: ve stock, catalogo revendedor, herramientas para compartir, panel `Mi Tienda`, pedidos, mensajes, academia, ranking.
- Administrador/soporte: gestiona catalogo, productos, stock, usuarios, pedidos, inventario, anuncios, mensajes y configuracion.

## No inventar

- Productos reales no presentes.
- Stock, talles o precios no confirmados.
- Ganancias garantizadas.
- Testimonios reales.
- Permisos Google concedidos.
- Integraciones productivas completas si solo estan planificadas.

