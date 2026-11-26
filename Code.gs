const PRODUCT_HEADERS = ['SKU', 'Brand', 'Product Name', 'Description'];

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Catalog Intake')
    .addItem('Run Catalog Intake', 'runCatalogIntake')
    .addToUi();
}

function runCatalogIntake() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const lock = LockService.getDocumentLock();
  lock.waitLock(10000);

  try {
    const rawSheet = spreadsheet.getSheetByName('Raw Products');
    if (!rawSheet || rawSheet.getLastRow() === 0) {
      throw new Error('Create a Raw Products tab and add the product headers in row 1.');
    }

    const [headers, ...rows] = rawSheet
      .getRange(1, 1, rawSheet.getLastRow(), PRODUCT_HEADERS.length)
      .getDisplayValues();

    if (PRODUCT_HEADERS.some((header, index) => headers[index].trim() !== header)) {
      throw new Error(`Raw Products row 1 must start with: ${PRODUCT_HEADERS.join(', ')}`);
    }

    const { readyRows, reviewRows } = classifyProducts(rows);
    writeOutput(spreadsheet, 'Ready to Import', PRODUCT_HEADERS, readyRows);
    writeOutput(spreadsheet, 'Needs Review', [...PRODUCT_HEADERS, 'Review Reason'], reviewRows);
    SpreadsheetApp.flush();
    spreadsheet.toast(`${readyRows.length} ready, ${reviewRows.length} need review.`, 'Catalog Intake');
  } finally {
    lock.releaseLock();
  }
}

function classifyProducts(rows) {
  const products = rows
    .map(row => row.map(value => value.trim()))
    .filter(row => row.some(value => value !== ''));
  const skuCounts = new Map();

  for (const [sku] of products) {
    if (sku) {
      skuCounts.set(sku, (skuCounts.get(sku) || 0) + 1);
    }
  }

  const readyRows = [];
  const reviewRows = [];
  for (const product of products) {
    const [sku, , productName] = product;
    const reasons = [];
    if (!sku) reasons.push('Missing SKU');
    if (!productName) reasons.push('Missing product name');
    if (skuCounts.get(sku) > 1) reasons.push('Duplicate SKU');

    if (reasons.length > 0) {
      reviewRows.push([...product, reasons.join(', ')]);
    } else {
      readyRows.push(product);
    }
  }

  return { readyRows, reviewRows };
}

function writeOutput(spreadsheet, name, headers, rows) {
  const sheet = spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name);
  const previousLastRow = sheet.getLastRow();
  const values = [headers, ...rows].map(row => row.map(value => {
    // Keep supplier text literal, including values that start with a formula marker.
    return /^[=']/.test(value) ? "'" + value : value;
  }));

  if (values.length > sheet.getMaxRows()) {
    sheet.insertRowsAfter(sheet.getMaxRows(), values.length - sheet.getMaxRows());
  }
  if (headers.length > sheet.getMaxColumns()) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), headers.length - sheet.getMaxColumns());
  }

  const range = sheet.getRange(1, 1, values.length, headers.length);
  range.setNumberFormat('@');
  range.setValues(values);
  if (previousLastRow > values.length) {
    sheet.getRange(values.length + 1, 1, previousLastRow - values.length, headers.length).clearContent();
  }
}
