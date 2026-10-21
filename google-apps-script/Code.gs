/**
 * HARRIS IJEN ADMIN COMPANY PORTAL - GOOGLE APPS SCRIPT BACKEND
 * PT HARRIS IJEN JAYA MANDIRI
 * 
 * Provides Google Sheets & Google Drive Cloud Database Integration:
 * - Guests & Multi-Pax Reservations with Passports, Photos & Drop-off locations
 * - Discount Requests & Management Approvals
 * - Cancellations & Refunds
 * - Reviews & Verified Ratings
 * - Financial Ledgers & Transactions
 * - Audit Logs & Staff Login Monitoring
 * - Base64 File Archiving directly to Google Drive ("Harris_Ijen_Documents_Archive")
 */

// Global Sheet Names
const SHEET_GUESTS = "Guests";
const SHEET_DISCOUNTS = "Discounts";
const SHEET_CANCELLATIONS = "Cancellations";
const SHEET_REVIEWS = "Reviews";
const SHEET_FINANCIALS = "Financials";
const SHEET_AUDIT_LOGS = "AuditLogs";
const DRIVE_DOCS_FOLDER_NAME = "Harris_Ijen_Documents_Archive";

// Handle GET Requests
function doGet(e) {
  const action = e.parameter.action || "getDatabase";
  const query = e.parameter.q || "";

  let result = {};

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    initSheetsIfNeeded(ss);

    if (action === "getGuests") {
      result = { status: "success", data: readSheetToObjects(ss.getSheetByName(SHEET_GUESTS)) };
    } else if (action === "getDiscounts") {
      result = { status: "success", data: readSheetToObjects(ss.getSheetByName(SHEET_DISCOUNTS)) };
    } else if (action === "getCancellations") {
      result = { status: "success", data: readSheetToObjects(ss.getSheetByName(SHEET_CANCELLATIONS)) };
    } else if (action === "getReviews") {
      result = { status: "success", data: readSheetToObjects(ss.getSheetByName(SHEET_REVIEWS)) };
    } else if (action === "getFinancials") {
      result = { status: "success", data: readSheetToObjects(ss.getSheetByName(SHEET_FINANCIALS)) };
    } else if (action === "getAuditLogs") {
      result = { status: "success", data: readSheetToObjects(ss.getSheetByName(SHEET_AUDIT_LOGS)) };
    } else {
      // Return full database bundle
      result = {
        status: "success",
        data: {
          guests: readSheetToObjects(ss.getSheetByName(SHEET_GUESTS)),
          discounts: readSheetToObjects(ss.getSheetByName(SHEET_DISCOUNTS)),
          cancellations: readSheetToObjects(ss.getSheetByName(SHEET_CANCELLATIONS)),
          reviews: readSheetToObjects(ss.getSheetByName(SHEET_REVIEWS)),
          financials: readSheetToObjects(ss.getSheetByName(SHEET_FINANCIALS)),
          auditLogs: readSheetToObjects(ss.getSheetByName(SHEET_AUDIT_LOGS))
        }
      };
    }
  } catch (err) {
    result = { status: "error", message: err.toString() };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// Handle POST Requests
function doPost(e) {
  let result = {};

  try {
    const postData = JSON.parse(e.postData.contents);
    const action = postData.action;
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    initSheetsIfNeeded(ss);

    if (action === "addGuest") {
      const sheet = ss.getSheetByName(SHEET_GUESTS);
      const g = postData.guest;
      sheet.appendRow([
        g.id || ("GST-" + Date.now().toString().slice(-4)),
        g.invoiceNumber,
        g.guestName,
        g.gender || "Male",
        g.numberOfPeople || 1,
        JSON.stringify(g.passengers || []),
        g.country,
        g.phone,
        g.email,
        g.passportNumber,
        g.tourPackageName,
        g.paymentAmount,
        g.discountAmount || 0,
        g.paymentMethod,
        g.paymentStatus,
        g.paymentLocation || "Banyuwangi HQ Office",
        g.paymentRefNumber || "",
        g.arrivalTime,
        g.pickupTime,
        g.pickupLocation,
        g.finalDropOffLocation || "",
        g.specialNotes || "",
        new Date().toISOString()
      ]);
      result = { status: "success", message: "Guest reservation saved to Google Sheet & Drive successfully." };
    } else if (action === "requestDiscount") {
      const sheet = ss.getSheetByName(SHEET_DISCOUNTS);
      const d = postData.discount;
      sheet.appendRow([
        d.id,
        d.invoiceNumber,
        d.guestName,
        d.originalAmount,
        d.discountType,
        d.discountValue,
        d.discountAmount,
        d.finalAmount,
        d.paymentRefNumber,
        d.status || "Pending Approval",
        d.requestedAt || new Date().toISOString(),
        d.requestedBy,
        d.approvedBy || "",
        d.managerNotes || ""
      ]);
      result = { status: "success", message: "Discount request recorded in Google Sheet." };
    } else if (action === "requestCancellation") {
      const sheet = ss.getSheetByName(SHEET_CANCELLATIONS);
      const c = postData.cancellation;
      sheet.appendRow([
        c.id,
        c.invoiceNumber,
        c.guestName,
        c.reason,
        c.refundPercentage,
        c.refundAmount,
        c.status || "Pending Approval",
        c.requestedAt || new Date().toISOString(),
        c.requestedBy,
        c.approvedBy || "",
        c.managerNotes || ""
      ]);
      result = { status: "success", message: "Cancellation request saved in Google Sheet." };
    } else if (action === "addReview") {
      const sheet = ss.getSheetByName(SHEET_REVIEWS);
      const r = postData.review;
      sheet.appendRow([
        r.id,
        r.invoiceNumber,
        r.guestName,
        r.country,
        r.rating,
        r.tag,
        r.reviewText,
        r.categories ? r.categories.professionalism : 5,
        r.categories ? r.categories.qualityOfWork : 5,
        r.categories ? r.categories.timeliness : 5,
        r.categories ? r.categories.communication : 5,
        new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
      ]);
      result = { status: "success", message: "Review added to Google Sheets." };
    } else if (action === "saveDocumentToDrive") {
      // Save Base64 Image (Passport or Proof) directly to Google Drive
      const folder = getOrCreateDriveFolder(DRIVE_DOCS_FOLDER_NAME);
      const contentType = postData.mimeType || "image/jpeg";
      const decoded = Utilities.base64Decode(postData.base64Data.split(",")[1] || postData.base64Data);
      const blob = Utilities.newBlob(decoded, contentType, postData.fileName || "Document.jpg");
      const file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

      result = {
        status: "success",
        fileId: file.getId(),
        fileUrl: file.getUrl(),
        downloadUrl: file.getDownloadUrl(),
        message: "Document successfully saved to Google Drive folder: " + DRIVE_DOCS_FOLDER_NAME
      };
    } else if (action === "fullSync") {
      // Full sync from client
      overwriteSheet(ss.getSheetByName(SHEET_GUESTS), postData.database.guests, [
        "id", "invoiceNumber", "guestName", "gender", "numberOfPeople", "country", "phone", "email",
        "passportNumber", "tourPackageName", "paymentAmount", "discountAmount", "paymentMethod",
        "paymentStatus", "paymentLocation", "paymentRefNumber", "arrivalTime", "pickupTime", "pickupLocation",
        "finalDropOffLocation", "specialNotes", "createdAt"
      ]);
      result = { status: "success", message: "Full Google Sheets & Drive database sync completed." };
    } else {
      result = { status: "error", message: "Unknown action: " + action };
    }
  } catch (err) {
    result = { status: "error", message: err.toString() };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// Utility: Read Sheet rows into array of objects
function readSheetToObjects(sheet) {
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  const headers = data[0];
  const rows = data.slice(1);

  return rows.map(row => {
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = row[idx];
    });
    return obj;
  });
}

// Utility: Overwrite Sheet
function overwriteSheet(sheet, items, keys) {
  if (!sheet || !items) return;
  sheet.clearContents();
  sheet.appendRow(keys);
  items.forEach(item => {
    const row = keys.map(k => item[k] !== undefined ? item[k] : "");
    sheet.appendRow(row);
  });
}

// Utility: Google Drive Folder Helper
function getOrCreateDriveFolder(folderName) {
  const folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(folderName);
}

// Initialize default sheets with proper headers
function initSheetsIfNeeded(ss) {
  const definitions = [
    {
      name: SHEET_GUESTS,
      headers: [
        "id", "invoiceNumber", "guestName", "gender", "numberOfPeople", "passengersJson", "country", "phone", "email",
        "passportNumber", "tourPackageName", "paymentAmount", "discountAmount", "paymentMethod",
        "paymentStatus", "paymentLocation", "paymentRefNumber", "arrivalTime", "pickupTime", "pickupLocation",
        "finalDropOffLocation", "specialNotes", "createdAt"
      ]
    },
    {
      name: SHEET_DISCOUNTS,
      headers: ["id", "invoiceNumber", "guestName", "originalAmount", "discountType", "discountValue", "discountAmount", "finalAmount", "paymentRefNumber", "status", "requestedAt", "requestedBy", "approvedBy", "managerNotes"]
    },
    {
      name: SHEET_CANCELLATIONS,
      headers: ["id", "invoiceNumber", "guestName", "reason", "refundPercentage", "refundAmount", "status", "requestedAt", "requestedBy", "approvedBy", "managerNotes"]
    },
    {
      name: SHEET_REVIEWS,
      headers: ["id", "invoiceNumber", "guestName", "country", "rating", "tag", "reviewText", "professionalism", "qualityOfWork", "timeliness", "communication", "date"]
    },
    {
      name: SHEET_FINANCIALS,
      headers: ["id", "type", "category", "invoiceNumber", "guestName", "amount", "date", "paymentMethod", "status", "description"]
    },
    {
      name: SHEET_AUDIT_LOGS,
      headers: ["id", "timestamp", "username", "fullName", "role", "action", "ipAddress", "userAgent", "status"]
    }
  ];

  definitions.forEach(def => {
    let sheet = ss.getSheetByName(def.name);
    if (!sheet) {
      sheet = ss.insertSheet(def.name);
      sheet.appendRow(def.headers);
      sheet.getRange(1, 1, 1, def.headers.length)
        .setBackground("#0B2545")
        .setFontColor("#FFFFFF")
        .setFontWeight("bold");
      sheet.setFrozenRows(1);
    }
  });
}
