const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const test = require('node:test');
const { runInThisContext } = require('node:vm');

const source = readFileSync(join(__dirname, '..', 'Code.gs'), 'utf8');
// Load the Apps Script function without changing Code.gs to export a Node module.
const classifyProducts = runInThisContext(`(function () {
${source}
return classifyProducts;
})()`, { filename: 'Code.gs' });

const cleanser = ['SKU-001', 'Demo Beauty', 'Daily Cleanser', 'Gentle face wash'];

test('accepts a valid product and trims surrounding whitespace', () => {
  const row = cleanser.map(value => ` ${value} `);
  assert.deepEqual(classifyProducts([row]), { readyRows: [cleanser], reviewRows: [] });
});

test('routes a missing product name to review with a reason', () => {
  const row = ['SKU-002', 'Demo Beauty', '', 'Fragrance-free body lotion'];
  assert.deepEqual(classifyProducts([row]), {
    readyRows: [],
    reviewRows: [[...row, 'Missing product name']],
  });
});

test('flags both rows sharing a SKU and accepts a separate valid product', () => {
  const first = ['SKU-003', 'Demo Beauty', 'Lip Balm', 'Unscented'];
  const second = ['SKU-003', 'Demo Beauty', 'Lip Balm', 'Vanilla'];
  assert.deepEqual(classifyProducts([first, cleanser, second]), {
    readyRows: [cleanser],
    reviewRows: [[...first, 'Duplicate SKU'], [...second, 'Duplicate SKU']],
  });
});
