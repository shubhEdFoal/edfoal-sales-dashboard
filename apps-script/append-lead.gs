/**
 * Google Apps Script — EdFoal "Add Lead" webhook
 *
 * One-time setup (~5 minutes):
 *
 *  1. Open your Google Sheet (the one connected to the dashboard).
 *  2. Extensions → Apps Script. A new project will open.
 *  3. Delete the contents of Code.gs and paste this entire file.
 *  4. Save (disk icon). Give the project any name (e.g. "EdFoal Webhook").
 *  5. Deploy → New deployment → select "Web app".
 *       - Description: Append Lead
 *       - Execute as: Me
 *       - Who has access: Anyone
 *     Click Deploy and authorize access with your Google account.
 *  6. Copy the deployment URL (https://script.google.com/macros/s/.../exec).
 *  7. Add it to the dashboard repo's .env.local:
 *       GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/.../exec
 *  8. Restart the dev server (npm run dev).
 *
 * This script accepts a POST request (JSON body with Lead fields), reads the
 * sheet's header row, matches each header to a Lead field via aliases, and
 * then appends a new row.
 *
 * If a header is missing in the sheet (e.g. "address"), that cell stays empty.
 * If there's an extra column not in Lead (e.g. "notes"), it also stays empty.
 */

const COLUMN_ALIASES = {
  id: ['id', 'lead id', 'lead_id', 'row id'],
  businessName: ['business name', 'business', 'company', 'businessname', 'name'],
  email: ['email', 'email address', 'e-mail'],
  phone: ['phone', 'phone number', 'mobile'],
  website: ['website', 'url', 'site', 'web'],
  address: ['address', 'location'],
  status: ['status', 'lead status'],
  sentId: ['sent id', 'sentid', 'sent_id', 'sent-id', 'message id', 'messageid'],
  emailStyle: ['email style', 'emailstyle', 'style', 'email type'],
  responded: ['responded', 'has responded', 'response'],
  replied: ['replied', 'has replied', 'reply'],
  timestamp: ['timestamp', 'date', 'time', 'sent at', 'created at'],
  campaignHealth: ['campaign health', 'health', 'campaignhealth'],
  shouldContinue: ['should continue', 'shouldcontinue', 'continue'],
  targetSegment: ['target segment', 'segment', 'targetsegment', 'industry'],
  followUpDay: [
    'follow up day',
    'follow-up day',
    'followupday',
    'follow up',
    'followuptiming',
    'follow up timing',
    'follow-up timing',
  ],
};

function normalize(value) {
  return String(value || '').trim().toLowerCase().replace(/[_-]+/g, ' ');
}

function findFieldForHeader(header) {
  const norm = normalize(header);
  for (const field in COLUMN_ALIASES) {
    if (COLUMN_ALIASES[field].indexOf(norm) !== -1) {
      return field;
    }
  }
  return null;
}

function formatValue(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return value;
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ ok: false, error: 'No POST body' });
    }

    const lead = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const lastColumn = sheet.getLastColumn();
    if (lastColumn === 0) {
      return jsonResponse({
        ok: false,
        error: 'The sheet has no header row. Add column names to row 1 first.',
      });
    }

    const headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
    const rowValues = headers.map(function (header) {
      const field = findFieldForHeader(header);
      if (!field) return '';
      return formatValue(lead[field]);
    });

    sheet.appendRow(rowValues);
    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function doGet() {
  return jsonResponse({
    ok: true,
    message: 'EdFoal Add Lead webhook is alive. POST a Lead JSON to append.',
  });
}
