import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.json({ error: `Error de Google Auth: ${error}` }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ error: 'Falta el código de autorización' }, { status: 400 });
  }

  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';

  console.log('[DEBUG AUTH] Client ID cargado:', GOOGLE_CLIENT_ID ? 'SÍ (longitud: ' + GOOGLE_CLIENT_ID.length + ')' : 'NO (undefined)');
  console.log('[DEBUG AUTH] Client Secret cargado:', GOOGLE_CLIENT_SECRET ? 'SÍ (longitud: ' + GOOGLE_CLIENT_SECRET.length + ')' : 'NO (undefined)');
  console.log('[DEBUG AUTH] Redirect URI usada:', GOOGLE_REDIRECT_URI);

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return NextResponse.json({ 
      error: 'Faltan las variables de entorno GOOGLE_CLIENT_ID o GOOGLE_CLIENT_SECRET en el servidor. Asegúrate de haber reiniciado el servidor con npm run dev.' 
    }, { status: 500 });
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      GOOGLE_REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.refresh_token) {
      // Nota: Si ya habías iniciado sesión antes, Google podría no enviar el refresh_token de nuevo a menos que desautoricés o uses prompt='consent'.
      return new NextResponse(
        `
        <html>
          <body style="background-color: #000; color: #fff; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; padding: 20px; text-align: center;">
            <div style="border: 1px solid #FF007A; padding: 30px; border-radius: 12px; background: #0a0a0a; max-width: 500px;">
              <h2 style="color: #FF007A;">⚠️ No se recibió Refresh Token</h2>
              <p style="color: #ccc; font-size: 14px; line-height: 1.6;">
                Google ya tenía registrada tu autorización. Para solucionarlo e indicar a Google que envíe el <strong>refresh_token</strong> nuevamente:
              </p>
              <ol style="text-align: left; color: #aaa; font-size: 13px; line-height: 1.6;">
                <li>Entra a <a href="https://myaccount.google.com/connections" target="_blank" style="color: #00E5FF;">Tus conexiones de Google</a>.</li>
                <li>Elimina el acceso de la aplicación "Eter CRM".</li>
                <li>Vuelve a hacer la prueba desde el Playground.</li>
              </ol>
              <a href="/google-playground" style="display: inline-block; margin-top: 20px; background: #222; color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none; border: 1px solid #333;">Volver al Playground</a>
            </div>
          </body>
        </html>
        `,
        { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }

    return new NextResponse(
      `
      <html>
        <body style="background-color: #000; color: #fff; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; padding: 20px; text-align: center;">
          <div style="border: 1px solid #00E5FF; padding: 30px; border-radius: 12px; background: #0a0a0a; max-width: 600px; box-shadow: 0 0 20px rgba(0, 229, 255, 0.1);">
            <h2 style="color: #00E5FF; margin-bottom: 10px;">🎉 ¡Conexión con Google Exitosa!</h2>
            <p style="color: #ccc; font-size: 14px;">Copia el siguiente token y agrégalo a tu archivo <strong>.env.local</strong>:</p>
            
            <div style="background: #111; border: 1px solid #222; padding: 15px; border-radius: 8px; margin: 20px 0; font-family: monospace; font-size: 12px; word-break: break-all; color: #00E5FF; user-select: all;">
              GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}
            </div>
            
            <p style="color: #888; font-size: 12px; margin-bottom: 25px;">Una vez que guardes el token en el archivo, reinicia el servidor de Next.js (ej. apagándolo y volviéndolo a iniciar con npm run dev).</p>
            
            <a href="/google-playground" style="display: inline-block; background: #00E5FF; color: #000; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              Volver al Playground
            </a>
          </div>
        </body>
      </html>
      `,
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );

  } catch (err: any) {
    console.error('Error obteniendo tokens de Google:', err);
    return NextResponse.json({ error: err.message || 'Error interno en el callback' }, { status: 500 });
  }
}
