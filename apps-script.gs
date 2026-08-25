/**
 * Open Mic Night — registration receiver.
 *
 * Setup (one time, ~2 minutes):
 *  1. Open the sheet:
 *     https://docs.google.com/spreadsheets/d/1JnVxHayy9UFelRGfX8EYtN1wyuf0hjftDyaXAwUcAM4/edit
 *  2. Extensions ▸ Apps Script. Delete whatever is there, paste this whole file, Save.
 *  3. Deploy ▸ New deployment ▸ type "Web app".
 *       Execute as:        Me
 *       Who has access:    Anyone
 *     Deploy, approve the permission prompt, and copy the /exec Web app URL.
 *  4. Paste that URL into ENDPOINT at the top of the <script> in index.html.
 */

var SHEET_ID = '1JnVxHayy9UFelRGfX8EYtN1wyuf0hjftDyaXAwUcAM4';
var SHEET_NAME = 'Registrations';
var HEADERS = ['Timestamp', 'Name', 'WhatsApp', 'Category', 'Piece / Song', 'Portfolio', 'Consent'];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var p = (e && e.parameter) || {};
    var sheet = getSheet_();

    sheet.appendRow([
      new Date(),
      p.name || '',
      "'" + String(p.phone || ''),   // leading quote keeps the leading digit/format intact
      p.category || '',
      p.title || '',
      p.portfolio || '',
      p.consent ? 'Yes' : 'No'
    ]);

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  // Diagnostic: reports which spreadsheet this endpoint is actually writing to,
  // every tab it can see, and how many rows are in the Registrations tab.
  try {
    var ss = SpreadsheetApp.openById(SHEET_ID);
    var tabs = ss.getSheets().map(function (sh) {
      return { name: sh.getName(), rows: sh.getLastRow() };
    });
    return json_({
      ok: true,
      message: 'Open Mic registration endpoint is live.',
      spreadsheet: ss.getName(),
      url: ss.getUrl(),
      tabs: tabs
    });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function getSheet_() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
