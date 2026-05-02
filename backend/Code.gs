var SHEET_NAME = "Projects";
var SPREADSHEET_ID = "1KY9_2bK7WhwlNyDtMvu0faUKFjELKGqFT-QsXJUBzxU"; // Replace with your actual Sheet ID
var SCRIPT_PROP = PropertiesService.getScriptProperties(); // Used for locking

function getDoc() {
  // Use openById since getActiveSpreadsheet() only works for bound scripts
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function setup() {
  var doc = getDoc();
  var sheet = doc.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = doc.insertSheet(SHEET_NAME);
    // Set headers
    sheet.appendRow([
      "id",
      "title",
      "short_description",
      "detailed_description",
      "image_url",
      "tags",
      "role",
    ]);
    // Freeze header row
    sheet.setFrozenRows(1);
  }
}

// Handle GET requests (Read Projects)
function doGet(e) {
  try {
    var doc = getDoc();
    var sheet = doc.getSheetByName(SHEET_NAME);

    if (!sheet) {
      return ContentService.createTextOutput(
        JSON.stringify({
          status: "error",
          message: "Sheet not found. Run setup() first.",
        }),
      ).setMimeType(ContentService.MimeType.JSON);
    }

    var rows = sheet.getDataRange().getValues();
    var headers = rows.shift(); // Remove headers

    var data = rows.map(function (row) {
      var item = {};
      headers.forEach(function (header, index) {
        item[header] = row[index];
      });
      return item;
    });

    // If fetching a specific ID
    if (e.parameter && e.parameter.id) {
      data = data.filter(function (item) {
        return item.id == e.parameter.id;
      });
    }

    return ContentService.createTextOutput(
      JSON.stringify({
        status: "success",
        data: data,
      }),
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (e) {
    return ContentService.createTextOutput(
      JSON.stringify({
        status: "error",
        message: e.toString(),
      }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle POST requests (Create, Update, Delete)
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var doc = getDoc();
    var sheet = doc.getSheetByName(SHEET_NAME);

    var params = JSON.parse(e.postData.contents);
    var action = params.action; // "add", "edit", "delete"
    var password = params.password;

    // VERY BASIC PASSWORD PROTECTION
    // Change "admin123" to your desired admin password
    if (password !== "admin123") {
      return ContentService.createTextOutput(
        JSON.stringify({
          status: "error",
          message: "Unauthorized",
        }),
      ).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "add") {
      var newId = new Date().getTime().toString();
      var newRow = [
        newId,
        params.title || "",
        params.short_description || "",
        params.detailed_description || "",
        params.image_url || "",
        params.tags || "",
        params.role || "",
      ];
      sheet.appendRow(newRow);

      return ContentService.createTextOutput(
        JSON.stringify({
          status: "success",
          message: "Project added",
          id: newId,
        }),
      ).setMimeType(ContentService.MimeType.JSON);
    } else if (action === "edit" || action === "delete") {
      var idToFind = params.id;
      var data = sheet.getDataRange().getValues();
      var rowIndex = -1;

      // Find row index (data array is 0-indexed, rows in sheet are 1-indexed)
      // Header is row 1, data starts row 2.
      for (var i = 1; i < data.length; i++) {
        if (data[i][0].toString() === idToFind.toString()) {
          rowIndex = i + 1; // +1 because array is 0-indexed, and getValues includes header
          break;
        }
      }

      if (rowIndex === -1) {
        return ContentService.createTextOutput(
          JSON.stringify({
            status: "error",
            message: "Project not found",
          }),
        ).setMimeType(ContentService.MimeType.JSON);
      }

      if (action === "delete") {
        sheet.deleteRow(rowIndex);
        return ContentService.createTextOutput(
          JSON.stringify({
            status: "success",
            message: "Project deleted",
          }),
        ).setMimeType(ContentService.MimeType.JSON);
      } else if (action === "edit") {
        var editRow = [
          idToFind,
          params.title || data[rowIndex - 1][1],
          params.short_description || data[rowIndex - 1][2],
          params.detailed_description || data[rowIndex - 1][3],
          params.image_url || data[rowIndex - 1][4],
          params.tags || data[rowIndex - 1][5],
          params.role || data[rowIndex - 1][6],
        ];
        // Overwrite row (range: startRow, startColumn, numRows, numCols)
        sheet.getRange(rowIndex, 1, 1, 7).setValues([editRow]);

        return ContentService.createTextOutput(
          JSON.stringify({
            status: "success",
            message: "Project updated",
          }),
        ).setMimeType(ContentService.MimeType.JSON);
      }
    }
  } catch (e) {
    return ContentService.createTextOutput(
      JSON.stringify({
        status: "error",
        message: e.toString(),
      }),
    ).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// We need to add the correct headers for CORS
function doOptions(e) {
  return ContentService.createTextOutput("").setMimeType(
    ContentService.MimeType.TEXT,
  );
}
