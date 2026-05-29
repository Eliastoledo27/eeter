# Requisitos funcionales de app mobile

## Principio de producto

La app debe ser mobile-first, rapida, visualmente ETER y orientada a vender/operar desde el celular. No crear landing extensa como primera experiencia: la pantalla inicial debe permitir entrar al catalogo, ver stock y acceder al panel.

## Navegacion recomendada

Bottom navigation:

- Inicio
- Catalogo
- Revender
- Herramientas IA
- Perfil/Panel

Para admin, agregar accesos dentro del Panel: Productos, Stock, Pedidos, Usuarios, Anuncios, Configuracion.

## Pantallas necesarias

- Inicio publico: marca, CTA a catalogo, CTA a revendedores, productos destacados, estado de stock.
- Catalogo: grilla/lista, busqueda, filtros, talles, stock, categorias.
- Detalle de producto: imagenes, descripcion, talles, disponibilidad, precio base/publico segun contexto, compartir, consultar stock.
- Revendedores: explicacion del sistema, margen propio, pasos, preguntas frecuentes, CTA login/registro.
- Login/registro: Google Sign-In y email si aplica.
- Dashboard privado: resumen por rol, accesos rapidos, estado de tienda.
- Mi Tienda: slug, WhatsApp, margen global, precios por producto, copiar link.
- Herramientas IA: mensajes WhatsApp, Gmail, publicaciones, descripciones, respuestas.
- Google Drive/archivos: listar documentos permitidos, resumir, preparar contenidos.
- Configuracion: cuenta, permisos, integraciones, seguridad.
- Administracion: productos, stock, pedidos, usuarios, anuncios, sync.

## Estados

Carga:

- Skeletons para catalogo y dashboard.
- Indicadores compactos, cian, sin bloquear toda la app si una seccion falla.

Vacio:

- Catalogo sin productos: "No hay productos activos. Revisa filtros o consulta stock."
- Talle sin stock: "Sin unidades para este talle."
- Revendedores sin slug: "Configura tu enlace para compartir tu catalogo."

Error:

- No exponer errores tecnicos crudos.
- Mostrar accion: reintentar, contactar soporte o revisar configuracion.
- Para IA: si falta API key, decir que requiere configuracion segura en servidor.

## Performance

- Imagenes optimizadas, lazy loading.
- Cache de catalogo con refresco manual.
- Evitar animaciones pesadas en listas largas.
- Interfaz usable offline parcialmente: cache ultimo catalogo y marcar fecha de actualizacion.
- No cargar videos pesados por defecto.

## Seguridad

- Nada de API keys en frontend.
- OAuth real.
- Variables de entorno.
- Confirmacion antes de enviar Gmail, modificar Drive, borrar productos o cambiar stock masivo.
- RLS/roles para admin, soporte, reseller y user.

