var SHEET_NAME = "Projects";
var SPREADSHEET_ID = "1KY9_2bK7WhwlNyDtMvu0faUKFjELKGqFT-QsXJUBzxU"; // Replace with your actual Sheet ID
var SCRIPT_PROP = PropertiesService.getScriptProperties(); // Used for locking

function getDoc() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function setup() {
  var doc = getDoc();
  var sheet = doc.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = doc.insertSheet(SHEET_NAME);
    sheet.appendRow([
      "id",
      "title",
      "short_description",
      "detailed_description",
      "image_url",
      "tags",
      "role",
      "media",
      "additional_images",
    ]);
    sheet.setFrozenRows(1);
  }
}

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
    var headers = rows.shift();

    var data = rows.map(function (row) {
      var item = {};
      headers.forEach(function (header, index) {
        // Handle cases where headers might be empty strings but column has data
        var key = header || "column_" + (index + 1);
        // Special case for our expected columns if headers are missing
        if (!header) {
          if (index === 7) key = "media";
          if (index === 8) key = "additional_images";
        }
        item[key] = row[index];
      });
      return item;
    });

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

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var doc = getDoc();
    var sheet = doc.getSheetByName(SHEET_NAME);

    var params = JSON.parse(e.postData.contents);
    var action = params.action;
    var password = params.password;

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
        params.media || "",
        params.additional_images || "",
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

      for (var i = 1; i < data.length; i++) {
        if (data[i][0].toString() === idToFind.toString()) {
          rowIndex = i + 1;
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
          params.media || data[rowIndex - 1][7],
          params.additional_images || data[rowIndex - 1][8],
        ];
        sheet.getRange(rowIndex, 1, 1, 9).setValues([editRow]);

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

function doOptions(e) {
  return ContentService.createTextOutput("").setMimeType(
    ContentService.MimeType.TEXT,
  );
}
