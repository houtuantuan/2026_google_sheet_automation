# Product Catalog Intake Automation

A Google Sheets workflow that checks fictional beauty supplier data and
routes products to Ready to Import or Needs Review.

# Learning project

## Run the validation tests

From the repository root, run the tests with Node.js 24:

```sh
node --test test/catalog-validation.test.cjs
```

GitHub Actions runs the same command on pushes and pull requests. The tests
exercise the validation logic in `Code.gs` using fictional products and run
without package installs, a Google Sheet, or a Gemini API key.
