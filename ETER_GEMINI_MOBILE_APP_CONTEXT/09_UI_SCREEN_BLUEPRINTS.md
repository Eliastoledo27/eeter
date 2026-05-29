# Blueprints de pantallas

## Inicio publico

- Objetivo: mostrar ETER y llevar a catalogo o revendedores.
- Elementos: logo, hero oscuro, producto/stock, CTAs, frases oficiales.
- Acciones: ver catalogo, quiero revender, login.
- Datos: productos destacados, resumen stock.
- Estados: carga, sin destacados, error catalogo.
- Mobile: primer viewport operativo, no landing larga.
- Prioridad: alta.

## Catalogo

- Objetivo: encontrar productos rapido.
- Elementos: search, filtros, chips talle, stock badges, grid/lista.
- Acciones: abrir detalle, filtrar, compartir, agregar/consultar.
- Datos: productos activos, stock_by_size.
- Estados: skeleton, vacio, filtros sin resultados.
- Mobile: sticky toolbar y drawer de filtros.
- Prioridad: alta.

## Detalle de producto

- Objetivo: decidir compra/publicacion.
- Elementos: galeria, nombre, categoria, precio, talles, stock, descripcion.
- Acciones: compartir, copiar texto, consultar stock, generar copy.
- Datos: producto, stock por talle, imagenes.
- Estados: sin imagen, sin stock, error.
- Mobile: imagen arriba, talles visibles sin scroll excesivo.
- Prioridad: alta.

## Revendedores

- Objetivo: explicar sistema y convertir.
- Elementos: pasos, margen propio, FAQ, CTA.
- Acciones: iniciar sesion, registrarse, abrir catalogo.
- Datos: reglas comerciales.
- Estados: publico.
- Mobile: bloques cortos.
- Prioridad: alta.

## Login

- Objetivo: entrar seguro.
- Elementos: Google Sign-In, email si aplica, estado de sesion.
- Acciones: login, registro, recuperar acceso.
- Datos: auth provider.
- Estados: cargando, error OAuth, usuario sin rol.
- Mobile: simple.
- Prioridad: alta.

## Dashboard privado

- Objetivo: centro operativo por rol.
- Elementos: tarjetas de stock, acciones rapidas, ultimas ventas/mensajes.
- Acciones: ir a catalogo, mi tienda, herramientas IA, pedidos.
- Datos: perfil, rol, metricas.
- Estados: sin datos, error permisos.
- Mobile: cards compactas, bottom nav.
- Prioridad: alta.

## Herramientas IA

- Objetivo: central de generadores.
- Elementos: listado de tools, historial, entrada rapida.
- Acciones: generar, copiar, guardar borrador.
- Datos: contexto ETER, productos si aplica.
- Estados: falta API, rate limit, resultado vacio.
- Mobile: formularios cortos por herramienta.
- Prioridad: media-alta.

## Redactor Gmail

- Objetivo: crear borradores de email.
- Elementos: destinatario, objetivo, tono, preview.
- Acciones: generar, editar, crear borrador, enviar con confirmacion.
- Datos: usuario, Gmail OAuth.
- Estados: sin permiso, preview pendiente.
- Prioridad: media.

## Google Drive / archivos

- Objetivo: usar documentos como soporte.
- Elementos: selector de archivo, lista, resumen, acciones.
- Acciones: leer, resumir, crear doc.
- Datos: Drive autorizado.
- Estados: sin permisos, archivo pesado, error.
- Prioridad: media.

## Configuracion

- Objetivo: cuenta, seguridad e integraciones.
- Elementos: perfil, WhatsApp, permisos Google, logout.
- Acciones: editar, conectar/desconectar.
- Datos: perfil y OAuth.
- Estados: guardando, error.
- Prioridad: media.

## Administracion

- Objetivo: operar productos, stock y usuarios.
- Elementos: tabla/lista productos, stock inline, carga imagen, importacion.
- Acciones: crear, editar, bulk, exportar, revalidar.
- Datos: Supabase productos, perfiles, pedidos.
- Estados: permisos insuficientes, confirmaciones.
- Prioridad: alta para admin, baja para publico.

