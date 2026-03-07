// ═══════════════════════════════════════════════════════════════════════════
//  DieLog — Google Apps Script Backend
//  Paste this entire file into your Apps Script project, then deploy as a
//  Web App (Execute as: Me, Who has access: Anyone).
// ═══════════════════════════════════════════════════════════════════════════

// ── CONFIGURATION ──────────────────────────────────────────────────────────
// Paste the ID of your master Google Sheet here.
// The Sheet ID is the long string in its URL:
//   https://docs.google.com/spreadsheets/d/  >>>SHEET_ID<<<  /edit
const SHEET_ID   = 'YOUR_GOOGLE_SHEET_ID';
const SHEET_NAME = 'DieLog Master';   // Tab name — will be created if missing

// Column order in your Sheet (do not reorder without updating both sides)
const COLUMNS = [
  'Timestamp',
  'User Email',
  'Die ID',
  'Press Number',
  'Shut Height (in)',
  'Guide Roller (in)',
  'SPM',
  'Feed Length (in)',
  'Steel #',
  'Steel Location',
  'Bins per Coil',
  'Date',
  'Notes'
];

// ── ENTRY POINT ────────────────────────────────────────────────────────────

/**
 * Handles POST requests from the DieLog app.
 * Body: JSON string { rows: [ {...}, {...} ] }
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (!data.rows || !Array.isArray(data.rows)) {
      return respond(400, 'Missing rows array');
    }

    const sheet = getOrCreateSheet();
    const added = appendRows(sheet, data.rows);

    return respond(200, `OK — ${added} row(s) added`);
  } catch (err) {
    console.error(err);
    return respond(500, err.message);
  }
}

/**
 * Handles GET requests — simple health check / test.
 * Visit the Web App URL in your browser to confirm it's working.
 */
function doGet() {
  const sheet = getOrCreateSheet();
  const count = Math.max(0, sheet.getLastRow() - 1); // subtract header row
  return respond(200, `DieLog backend is running. ${count} entries in sheet.`);
}

// ── HELPERS ────────────────────────────────────────────────────────────────

function getOrCreateSheet() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    // First run — create tab and write header row
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(COLUMNS);

    // Style header row
    const headerRange = sheet.getRange(1, 1, 1, COLUMNS.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#1a1a2e');
    headerRange.setFontColor('#f0a500');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 160);  // Timestamp
    sheet.setColumnWidth(2, 200);  // User Email
    sheet.setColumnWidth(3, 100);  // Die ID
  }

  return sheet;
}

function appendRows(sheet, rows) {
  let added = 0;
  rows.forEach(row => {
    sheet.appendRow([
      row.timestamp     || new Date().toISOString(),
      row.user          || '',
      row.dieId         || '',
      row.press         || '',
      row.shutHeight    || '',
      row.guideRoller   || '',
      row.spm           || '',
      row.feedLength    || '',
      row.steel         || '',
      row.steelLocation || '',
      row.binsPerCoil   || '',
      row.date          || '',
      row.notes         || ''
    ]);
    added++;
  });
  return added;
}

function respond(status, message) {
  const payload = JSON.stringify({ status, message });
  return ContentService
    .createTextOutput(payload)
    .setMimeType(ContentService.MimeType.JSON);
}
