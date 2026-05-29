# Integraciones Google

## Reglas globales

- No exponer API keys en frontend.
- Usar variables de entorno.
- Usar OAuth real.
- No enviar emails sin confirmacion explicita.
- No borrar ni modificar archivos sin confirmacion explicita.
- Separar permisos por usuario y rol.

## Firebase Authentication con Google Sign-In

Uso:

- Login mobile con Google.
- Asociar usuario a rol ETER: user, reseller, support, admin.

Permisos:

- Perfil basico: email, nombre, avatar.

No debe:

- Crear rol admin automaticamente por email hardcodeado.
- Exponer tokens en logs.

Preparar:

- Claims o tabla de perfiles.
- Vinculo con Supabase si se mantiene Supabase como backend.

## Google Drive

Uso:

- Leer archivos elegidos por el usuario.
- Guardar materiales comerciales aprobados.
- Generar/resumir documentos.

Permisos:

- Preferir acceso por archivo seleccionado.
- Evitar acceso total a Drive salvo necesidad confirmada.

Puede leer:

- Archivos que el usuario autoriza.

Puede escribir:

- Borradores o documentos nuevos solo con confirmacion.

No debe:

- Borrar archivos automaticamente.
- Editar documentos sin preview y confirmacion.

## Gmail

Uso:

- Crear borradores.
- Redactar respuestas.
- Preparar emails a clientes/proveedores.

Permisos:

- Leer mensajes solo si el usuario lo pide.
- Crear borradores.
- Enviar solo con confirmacion final.

No debe:

- Enviar mails automaticos.
- Responder cadenas sin mostrar preview.

## Google Sheets

Uso:

- Import/export de catalogo, stock, pedidos y reportes.

Permisos:

- Leer/escribir hojas elegidas.

Debe confirmar:

- Cargas masivas.
- Cambios de precios.
- Cambios de stock.
- Borrado de filas.

## Google Docs

Uso:

- Documentacion, guias de revendedor, scripts comerciales.

Acciones:

- Crear borradores.
- Resumir.
- Convertir docs a guias internas.

No debe:

- Publicar documentos sin aprobacion.

## Google Calendar

Uso aplicable:

- Recordatorios de drops, reuniones, entregas, seguimiento de proveedores.

Permisos:

- Leer agenda si el usuario solicita disponibilidad.
- Crear eventos con confirmacion.

Preparar V1:

- Modelo de permiso y UI, aunque no se implemente en primera version.

