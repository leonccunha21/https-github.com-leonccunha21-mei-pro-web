/**
 * Google Drive and Google Sheets REST API Wrappers
 */

import { clearAccessToken } from './firebase';

export interface GoogleDriveFile {
  id: string;
  name: string;
  webViewLink: string;
  modifiedTime: string;
}

/**
 * Helper to handle Google API auth errors (401/403)
 */
function handleAuthError(response: Response, err: any): never {
  const status = response.status;
  const msg = err?.error?.message || '';
  
  if (status === 401 || status === 403) {
    clearAccessToken();
    if (msg.includes('has not been used') || msg.includes('is disabled')) {
      throw new Error('A API do Google não está habilitada. Acesse o Google Cloud Console e ative as APIs Drive e Sheets.');
    }
    if (msg.includes('invalid_token') || msg.includes('Token has been expired') || msg.includes('Token expired')) {
      throw new Error('Sessão Google expirada. Faça login novamente com sua conta Google.');
    }
    throw new Error('Acesso negado pelo Google. Faça login novamente com sua conta Google.');
  }
  
  throw new Error(msg || 'Erro desconhecido na API do Google.');
}

/**
 * Lists the spreadsheets available in the user's Google Drive.
 */
export async function listUserSpreadsheets(accessToken: string): Promise<GoogleDriveFile[]> {
  try {
    const query = encodeURIComponent("mimeType='application/vnd.google-apps.spreadsheet' and trashed=false");
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${query}&orderBy=modifiedTime%20desc&pageSize=15&fields=files(id,name,webViewLink,modifiedTime)`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        }
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      handleAuthError(response, err);
    }

    const data = await response.json();
    return data.files || [];
  } catch (error) {
    console.error('Erro listUserSpreadsheets:', error);
    throw error;
  }
}

/**
 * Creates a new Google Sheet, populates it with headers and row values.
 * Returns the spreadsheet webViewLink.
 */
export async function createSpreadsheet(
  accessToken: string,
  title: string,
  headers: string[],
  rows: any[][]
): Promise<{ id: string; webViewLink: string }> {
  try {
    // 1. Create the spreadsheet
    const createResponse = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          title: title,
        }
      })
    });

    if (!createResponse.ok) {
      const err = await createResponse.json().catch(() => ({}));
      handleAuthError(createResponse, err);
    }

    const spreadsheet = await createResponse.json();
    const spreadsheetId = spreadsheet.spreadsheetId;
    const webViewLink = spreadsheet.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

    // 2. Append/Write values (headers + rows)
    const values = [headers, ...rows];
    const writeResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: values,
        })
      }
    );

    if (!writeResponse.ok) {
      const err = await writeResponse.json().catch(() => ({}));
      handleAuthError(writeResponse, err);
    }

    return { id: spreadsheetId, webViewLink };
  } catch (error) {
    console.error('Erro ao criar planilha:', error);
    throw error;
  }
}

/**
 * Uploads a file (like a JSON backup) to the user's Google Drive.
 */
export async function uploadBackupFile(
  accessToken: string,
  filename: string,
  content: any
): Promise<{ id: string; name: string; webViewLink: string }> {
  try {
    const boundary = 'MEI_PRO_BOUND_MARKER';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelim = `\r\n--${boundary}--`;

    const metadata = {
      name: filename,
      mimeType: 'application/json',
      description: 'Backup de dados do sistema GESTÃO.PRO'
    };

    const body = 
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(content, null, 2) +
      closeDelim;

    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: body
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      handleAuthError(response, err);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro uploadBackupFile:', error);
    throw error;
  }
}

/**
 * Fetches values from an existing Google Spreadsheet.
 */
export async function fetchSpreadsheetValues(
  accessToken: string,
  spreadsheetId: string,
  range: string = 'Sheet1!A1:Z1000'
): Promise<any[][]> {
  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        }
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      handleAuthError(response, err);
    }

    const data = await response.json();
    return data.values || [];
  } catch (error) {
    console.error('Erro fetchSpreadsheetValues:', error);
    throw error;
  }
}

/**
 * Exports a Google Spreadsheet as an XLSX file (ArrayBuffer) from Google Drive.
 */
export async function exportSpreadsheetAsArrayBuffer(
  accessToken: string,
  spreadsheetId: string
): Promise<ArrayBuffer> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${spreadsheetId}/export?mimeType=application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      }
    );

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      if (response.status === 401 || response.status === 403) {
        clearAccessToken();
        throw new Error('Acesso negado pelo Google. Faça login novamente com sua conta Google.');
      }
      throw new Error('Falha ao exportar planilha do Drive para XLSX. Verifique se o arquivo é válido.');
    }

    return await response.arrayBuffer();
  } catch (error) {
    console.error('Erro exportSpreadsheetAsArrayBuffer:', error);
    throw error;
  }
}
