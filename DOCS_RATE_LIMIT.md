# Solución de Problemas: Email Rate Limit Exceeded

Si encuentras el error `Email rate limit exceeded` o `Límite de envíos excedido` al intentar registrarte, esto se debe a las políticas de seguridad por defecto de Supabase para prevenir spam.

## Causa
Supabase impone límites en la cantidad de correos electrónicos que se pueden enviar por hora/día en el plan gratuito para proteger la reputación del dominio de envío.

## Soluciones

### Opción 1: Desactivar Confirmación de Email (Recomendado para Desarrollo)
Esta es la solución más rápida para trabajar en local sin restricciones.

1. Ve a tu [Supabase Dashboard](https://supabase.com/dashboard).
2. Selecciona tu proyecto.
3. En el menú lateral, ve a **Authentication** -> **Providers**.
4. Despliega la sección **Email**.
5. Desactiva la opción **Confirm email**.
6. Guarda los cambios.

*Ahora los usuarios se crearán y loguearán automáticamente sin esperar un correo.*

### Opción 2: Aumentar los Límites (Rate Limits)
Si necesitas probar el flujo de emails real:

1. Ve a **Authentication** -> **Rate Limits**.
2. Aumenta los valores de:
   - `Email OTP`
   - `Signups`
3. Considera configurar tu propio proveedor SMTP (Resend, SendGrid, AWS SES) en **Settings** -> **SMTP Settings** para evitar los límites estrictos de Supabase.

### Opción 3: Esperar
Si has excedido el límite, el bloqueo suele durar **1 hora**.

## Nota de Seguridad
El código de la aplicación ha sido actualizado para:
1. Detectar este error específicamente y avisarte.
2. Prevenir múltiples intentos de clic seguidos (Client-side throttling).
3. Mostrar un tiempo de espera sugerido.
