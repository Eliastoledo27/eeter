'use server'

import {
  gmailSendEmail,
  calendarCreateEvent,
  sheetsExportData,
  driveUploadFile,
  mapsAutocompleteAddress,
  getGoogleAuthUrl
} from '@/lib/google';

export async function actionSendTestEmail(to: string, subject: string, htmlContent: string) {
  try {
    const res = await gmailSendEmail({ to, subject, htmlContent });
    return { success: true, data: res };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error en Gmail Server Action' };
  }
}

export async function actionCreateTestEvent(
  summary: string,
  description: string,
  startDateTime: string,
  endDateTime: string,
  attendeeEmail: string
) {
  try {
    const res = await calendarCreateEvent({
      summary,
      description,
      startDateTime,
      endDateTime,
      attendeeEmail
    });
    return { success: true, data: res };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error en Calendar Server Action' };
  }
}

export async function actionExportTestSheets(values: any[][]) {
  try {
    const res = await sheetsExportData({
      range: 'Sheet1!A:E',
      values
    });
    return { success: true, data: res };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error en Sheets Server Action' };
  }
}

export async function actionUploadTestDrive(fileName: string, fileContentText: string) {
  try {
    const buffer = Buffer.from(fileContentText, 'utf-8');
    const res = await driveUploadFile({
      fileName,
      mimeType: 'text/plain',
      fileBuffer: buffer
    });
    return { success: true, data: res };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error en Drive Server Action' };
  }
}

export async function actionGetMapsAutocomplete(input: string) {
  try {
    const res = await mapsAutocompleteAddress(input);
    return { success: true, predictions: res.predictions, simulated: res.simulated };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error en Maps Server Action' };
  }
}

export async function actionGetAuthUrl() {
  try {
    const url = getGoogleAuthUrl();
    return { success: true, url };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error generando URL de Auth' };
  }
}
