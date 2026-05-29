/**
 * Éter Google API Integration Service
 * Soporta modo real (con credenciales en variables de entorno) y modo simulación de alta fidelidad.
 */

import { google } from 'googleapis';

// Configuración de variables de entorno de Google
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';
const GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Inicialización de OAuth2 si las credenciales están disponibles
const oauth2Client = GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET
  ? new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI)
  : null;

if (oauth2Client && GOOGLE_REFRESH_TOKEN) {
  oauth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });
}

export const isGoogleConfigured = (): boolean => {
  return !!(oauth2Client && GOOGLE_REFRESH_TOKEN);
};

// ----------------------------------------------------
// 1. GMAIL SERVICE
// ----------------------------------------------------
export interface SendEmailParams {
  to: string;
  subject: string;
  htmlContent: string;
}

export async function gmailSendEmail(params: SendEmailParams) {
  if (!isGoogleConfigured()) {
    console.log(`[SIMULADO GMAIL] Enviando correo a ${params.to}. Asunto: ${params.subject}`);
    await new Promise((resolve) => setTimeout(resolve, 800)); // Simula latencia
    return {
      success: true,
      messageId: `simulated-id-${Math.random().toString(36).substring(7)}@eter.store`,
      simulated: true,
      timestamp: new Date().toISOString()
    };
  }

  try {
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client! });
    
    // Crear el correo en formato MIME RFC 2822
    const messageParts = [
      `To: ${params.to}`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${params.subject}`,
      '',
      params.htmlContent,
    ];
    const rawMessage = Buffer.from(messageParts.join('\n'))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const res = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: rawMessage,
      },
    });

    return {
      success: true,
      messageId: res.data.id,
      simulated: false,
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    console.error('Error enviando email vía Gmail API:', error);
    throw new Error(error.message || 'Error en Gmail API');
  }
}

// ----------------------------------------------------
// 2. GOOGLE CALENDAR SERVICE
// ----------------------------------------------------
export interface CreateEventParams {
  summary: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  attendeeEmail: string;
}

export async function calendarCreateEvent(params: CreateEventParams) {
  if (!isGoogleConfigured()) {
    console.log(`[SIMULADO CALENDAR] Creando evento: ${params.summary} con ${params.attendeeEmail}`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      success: true,
      eventId: `simulated-event-${Math.random().toString(36).substring(7)}`,
      htmlLink: 'https://calendar.google.com/calendar/r/eventedit',
      meetLink: 'https://meet.google.com/abc-defg-hij',
      simulated: true,
      timestamp: new Date().toISOString()
    };
  }

  try {
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client! });
    const res = await calendar.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: 1,
      requestBody: {
        summary: params.summary,
        description: params.description,
        start: {
          dateTime: params.startDateTime,
          timeZone: 'America/Argentina/Buenos_Aires',
        },
        end: {
          dateTime: params.endDateTime,
          timeZone: 'America/Argentina/Buenos_Aires',
        },
        attendees: [{ email: params.attendeeEmail }],
        conferenceData: {
          createRequest: {
            requestId: `meet-${Math.random().toString(36).substring(7)}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      },
    });

    return {
      success: true,
      eventId: res.data.id,
      htmlLink: res.data.htmlLink,
      meetLink: res.data.conferenceData?.entryPoints?.[0]?.uri || null,
      simulated: false,
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    console.error('Error creando evento vía Calendar API:', error);
    throw new Error(error.message || 'Error en Calendar API');
  }
}

// ----------------------------------------------------
// 3. GOOGLE SHEETS SERVICE
// ----------------------------------------------------
export interface ExportDataParams {
  spreadsheetId?: string;
  range: string;
  values: any[][];
}

export async function sheetsExportData(params: ExportDataParams) {
  if (!isGoogleConfigured()) {
    console.log(`[SIMULADO SHEETS] Exportando ${params.values.length} filas al rango ${params.range}`);
    await new Promise((resolve) => setTimeout(resolve, 900));
    return {
      success: true,
      spreadsheetId: params.spreadsheetId || 'simulated-spreadsheet-id-12345',
      updatedCells: params.values.length * params.values[0].length,
      simulated: true,
      timestamp: new Date().toISOString()
    };
  }

  try {
    const sheets = google.sheets({ version: 'v4', auth: oauth2Client! });
    const spreadsheetId = params.spreadsheetId || process.env.GOOGLE_SPREADSHEET_ID;
    
    if (!spreadsheetId) {
      throw new Error('ID de la hoja de cálculo de Google Sheets no especificado.');
    }

    const res = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: params.range,
      valueInputOption: 'RAW',
      requestBody: {
        values: params.values,
      },
    });

    return {
      success: true,
      spreadsheetId,
      updatedCells: res.data.updates?.updatedCells || 0,
      simulated: false,
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    console.error('Error exportando datos a Sheets API:', error);
    throw new Error(error.message || 'Error en Sheets API');
  }
}

// ----------------------------------------------------
// 4. GOOGLE DRIVE SERVICE
// ----------------------------------------------------
export interface UploadFileParams {
  fileName: string;
  mimeType: string;
  fileBuffer: Buffer;
  folderId?: string;
}

export async function driveUploadFile(params: UploadFileParams) {
  if (!isGoogleConfigured()) {
    console.log(`[SIMULADO DRIVE] Subiendo archivo "${params.fileName}" (${params.mimeType})`);
    await new Promise((resolve) => setTimeout(resolve, 1100));
    return {
      success: true,
      fileId: `simulated-drive-file-${Math.random().toString(36).substring(7)}`,
      webViewLink: 'https://drive.google.com/file/d/simulated-file-id/view',
      simulated: true,
      timestamp: new Date().toISOString()
    };
  }

  try {
    const drive = google.drive({ version: 'v3', auth: oauth2Client! });
    const folderId = params.folderId || process.env.GOOGLE_DRIVE_FOLDER_ID;

    const fileMetadata = {
      name: params.fileName,
      parents: folderId ? [folderId] : undefined,
    };

    const media = {
      mimeType: params.mimeType,
      body: new (require('stream').Readable)({
        read() {
          this.push(params.fileBuffer);
          this.push(null);
        }
      }),
    };

    const res = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink',
    });

    return {
      success: true,
      fileId: res.data.id,
      webViewLink: res.data.webViewLink,
      simulated: false,
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    console.error('Error subiendo archivo a Drive API:', error);
    throw new Error(error.message || 'Error en Drive API');
  }
}

// ----------------------------------------------------
// 5. GOOGLE MAPS SERVICE
// ----------------------------------------------------
export async function mapsAutocompleteAddress(input: string) {
  if (!GOOGLE_MAPS_API_KEY) {
    // Simulación inteligente basada en lo que escribe el usuario
    const mockAddresses = [
      { description: `${input || 'Avenida Alvear 1800'}, Recoleta, CABA, Argentina`, placeId: 'ch-alvear-1800' },
      { description: `${input || 'Corrientes 1200'}, San Nicolás, CABA, Argentina`, placeId: 'ch-corrientes-1200' },
      { description: `${input || 'Libertador 4500'}, Palermo, CABA, Argentina`, placeId: 'ch-libertador-4500' },
      { description: `${input || 'Ritz-Carlton Way 100'}, Boston, MA, USA`, placeId: 'ch-ritz-100' },
      { description: `${input || 'Vía Montenapoleone 8'}, Milán, Italia`, placeId: 'ch-montenapoleone-8' },
    ];
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      success: true,
      predictions: mockAddresses,
      simulated: true
    };
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        input
      )}&key=${GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();
    return {
      success: true,
      predictions: data.predictions.map((p: any) => ({
        description: p.description,
        placeId: p.place_id,
      })),
      simulated: false
    };
  } catch (error: any) {
    console.error('Error en Maps Autocomplete:', error);
    throw new Error('Error en Maps Autocomplete API');
  }
}

// ----------------------------------------------------
// 6. GOOGLE OAUTH URL GENERATOR
// ----------------------------------------------------
export function getGoogleAuthUrl() {
  if (!oauth2Client) {
    return 'https://accounts.google.com/o/oauth2/v2/auth?client_id=simulated&redirect_uri=simulated';
  }
  
  const scopes = [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file'
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });
}
