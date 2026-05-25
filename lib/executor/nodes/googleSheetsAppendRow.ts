import { google } from 'googleapis';
import { type ExecutionContext, type NodeResult } from '@/types/executor';
import { decryptToken } from '@/lib/crypto';

interface ColumnMapping {
  column: string;
  valueSource: 'trigger_field' | 'static';
  triggerField?: string;
  staticValue?: string;
}

export interface GoogleSheetsAppendRowConfig {
  credentialId?: string;
  spreadsheetId?: string;
  sheetName?: string;
  columnMappings?: ColumnMapping[];
}

export async function execute(
  config: GoogleSheetsAppendRowConfig,
  context: ExecutionContext
): Promise<NodeResult> {
  const { credentialId, spreadsheetId, sheetName, columnMappings } = config;

  if (!credentialId) throw new Error('Missing Google Sheets credential ID');
  if (!spreadsheetId) throw new Error('Missing Spreadsheet ID');
  if (!sheetName) throw new Error('Missing Sheet Name');

  // 1. Fetch credential
  const { data: cred, error } = await context.supabase
    .from('credentials')
    .select('encrypted_token, service')
    .eq('id', credentialId)
    .single();

  if (error || !cred) return { status: 'error', error: 'Credential not found' };
  if (cred.service !== 'google_sheets') return { status: 'error', error: 'Invalid credential type' };

  const tokenJsonStr = decryptToken(cred.encrypted_token);
  let credentials;
  try {
    credentials = JSON.parse(tokenJsonStr);
  } catch {
    return { status: 'error', error: 'Invalid Service Account JSON in credential' };
  }

  // 2. Auth with Google
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  // 3. Prepare row data based on mappings
  let maxColIndex = -1;
  const rowArray: any[] = [];
  const mappings = columnMappings || [];
  
  for (const map of mappings) {
    if (!map.column) continue;
    const colStrMatch = map.column.match(/([A-Z]+)$/i);
    if (!colStrMatch) continue;
    
    const colStr = colStrMatch[1].toUpperCase();
    let colIndex = 0;
    for (let i = 0; i < colStr.length; i++) {
      colIndex = colIndex * 26 + (colStr.charCodeAt(i) - 64);
    }
    colIndex -= 1; // 0-indexed

    if (colIndex > maxColIndex) maxColIndex = colIndex;

    let val: any = '';
    if (map.valueSource === 'trigger_field' && map.triggerField) {
      val = context.triggerData[map.triggerField] ?? '';
    } else if (map.valueSource === 'static') {
      val = map.staticValue ?? '';
    }

    rowArray[colIndex] = val;
  }

  // Fill empty spots with empty strings so Google Sheets aligns them correctly
  for (let i = 0; i <= maxColIndex; i++) {
    if (rowArray[i] === undefined) rowArray[i] = '';
  }

  // 4. Append row
  try {
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A1`, // Append anywhere below A1
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [rowArray]
      }
    });

    return {
      status: 'success',
      output: {
        updates: response.data.updates,
        row: rowArray,
      }
    };
  } catch (err: any) {
    console.error('[Google Sheets] Append Error:', err);
    throw new Error(err.message || 'Failed to append row to Google Sheets');
  }
}
