# Prompt final para Google AI Studio / Gemini

Usa todos los archivos adjuntos como contexto oficial de ETER. Estos documentos reemplazan cualquier suposicion generica. Tu tarea es crear una app mobile-first de ETER basada en este contexto, sin inventar informacion comercial no confirmada.

Objetivo: disenar e implementar una aplicacion movil para ETER, marca de calzado urbano premium de Mar del Plata, con catalogo, stock real por talle, sistema de revendedores con margen propio, login, dashboard privado, herramientas IA e integraciones Google preparadas.

Reglas de marca:

- Mantener dark mode premium.
- Usar negro profundo, cian ETER, verde neon y violeta electrico con moderacion.
- Tipografia fuerte, uppercase para titulos y microcopy.
- Tono directo, cercano, con voseo argentino.
- Decir Mar del Plata como ubicacion principal.
- No decir Buenos Aires como identidad principal.
- No usar estilo corporativo exagerado.
- No usar emojis innecesarios.
- No prometer ganancias.
- No inventar stock, precios ni talles.
- No usar "comision" como concepto principal; usar "margen propio".

Pantallas requeridas:

- Inicio publico.
- Catalogo.
- Detalle de producto.
- Revendedores.
- Login/registro con Google Sign-In.
- Dashboard privado.
- Mi Tienda de revendedor.
- Herramientas IA.
- Redactor Gmail.
- Google Drive / archivos.
- Configuracion.
- Administracion para roles autorizados.

Integraciones:

- Firebase Authentication con Google Sign-In o auth equivalente bien estructurado.
- Google Drive preparado con OAuth.
- Gmail preparado para crear borradores y enviar solo con confirmacion.
- Google Sheets/Docs preparados para futuras importaciones/documentos.
- Supabase o backend equivalente para productos, perfiles, roles, stock y pedidos.

Seguridad:

- No exponer API keys en frontend.
- Usar variables de entorno.
- Nunca copiar claves hardcodeadas del proyecto original.
- No borrar, modificar, enviar emails ni editar archivos sin confirmacion explicita.
- Separar permisos por roles: cliente, revendedor, soporte, admin.

Herramientas IA:

- Generador de WhatsApp.
- Redactor Gmail.
- Generador de publicaciones.
- Generador de descripciones.
- Respuestas para clientes.
- Respuestas para proveedores.
- Buscador interno ETER.
- Resumen de documentos.
- Auditoria de catalogo.

Catalogo:

- Mostrar stock real por talle cuando exista.
- Si falta dato, usar "Consultar stock" o `PENDIENTE_DE_CONFIRMAR`.
- Incluir estados de carga, vacio y error.
- Permitir buscar, filtrar por categoria/talle/stock y compartir.

Revendedores:

- Explicar margen propio.
- Incluir calculadora de margen.
- Permitir copiar link de catalogo.
- Permitir generar mensajes y publicaciones.
- Siempre recomendar confirmar stock antes de cerrar.

Output esperado:

1. Arquitectura de app propuesta.
2. Componentes/pantallas implementadas.
3. Modelo de datos.
4. Flujo de auth y roles.
5. Integraciones preparadas.
6. Instrucciones para ejecutar.
7. Lista de pendientes marcados como `PENDIENTE_DE_CONFIRMAR`.

Prioridad de implementacion:

1. Catalogo + detalle + stock.
2. Login + roles.
3. Dashboard revendedor + Mi Tienda.
4. Herramientas IA.
5. Admin.
6. Integraciones Google avanzadas.

Prohibiciones:

- No crear una app generica sin identidad ETER.
- No inventar productos reales.
- No inventar credenciales.
- No enviar emails automaticamente.
- No modificar Drive automaticamente.
- No prometer ganancias.
- No reemplazar Mar del Plata por Buenos Aires.

