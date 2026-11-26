# Product Catalog Intake Automation

A Google Sheets workflow for a catalog operations team that receives supplier
product lists. Google Apps Script checks for missing fields and duplicate SKUs,
then Gemini suggests a category for valid products. The workflow writes products
to `Ready to Import` or `Needs Review`, with a reason for each flagged row.

## Two-minute demo

| Time | Show | Explain |
| --- | --- | --- |
| 0:00–0:25 | `Raw Products` | A catalog operator needs to check required fields, spot duplicate SKUs, and categorize products before import. |
| 0:25–0:55 | **Catalog Intake → Run Catalog Intake**, then `Ready to Import` | The workflow found one valid product. Gemini suggested `Skincare` for the Daily Cleanser. |
| 0:55–1:25 | `Needs Review` | One product is missing its name. Both rows sharing `SKU-003` are flagged so the operator can decide which entry to keep. |
| 1:25–2:00 | Run the workflow again, then show **Catalog validation** in GitHub Actions | Rerunning refreshes the output and keeps the same row counts. GitHub runs three validation tests on code changes. |

## Reproduce the demo

1. Create a Google Sheet and name the first tab `Raw Products`. Paste the
   tab-separated sample below into A1.
2. Open **Extensions → Apps Script**, replace the editor contents with
   [`Code.gs`](Code.gs), and save.
3. In **Project Settings → Script Properties**, add `GEMINI_API_KEY` with
   your own Gemini API key. Keep the key in Script Properties.
4. Reload the spreadsheet and choose **Catalog Intake → Run Catalog Intake**.
   Approve access if prompted. With Gemini available, expect one ready row
   and three review rows.

```tsv
SKU	Brand	Product Name	Description
SKU-001	Demo Beauty	Daily Cleanser	Gentle face wash
SKU-002	Demo Beauty		Fragrance-free body lotion
SKU-003	Demo Beauty	Lip Balm	Unscented lip balm
SKU-003	Demo Beauty	Lip Balm	Unscented lip balm
```

## Run the validation tests

From the repository root, run the tests with Node.js 24:

```sh
node --test test/catalog-validation.test.cjs
```

GitHub Actions runs the same command on pushes and pull requests. The tests
exercise the validation logic in `Code.gs` using fictional products and run
without package installs, a Google Sheet, or a Gemini API key.
