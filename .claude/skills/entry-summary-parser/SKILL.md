---
name: entry-summary-parser
description: Use when editing or debugging the CBP Form 7501 PDF extraction and IEEPA refund-eligibility logic in lib/pdf/parse-entry-summary.mjs, the pages/api/upload.js ingest flow, or anything touching HTS 9903.01.XX codes, duty/refund amounts, entry-number/filer-code/country-of-origin extraction, the upload_hash dedup, or the entry_summaries / tariff_line_items / site_stats tables. Read before changing any parser regex — PDF text is space-stripped and extraction is positional and brittle. Sample PDFs are in .claude/temp/example-entry-summaries/.
---

# Entry Summary Parser (CBP 7501 → IEEPA Refund)

The domain core of this app. `lib/pdf/parse-entry-summary.mjs` turns an uploaded CBP Form 7501 PDF into a
refund-eligibility verdict. `pages/api/upload.js` is the only caller that writes results.

## What "eligible" means

A line item is an **IEEPA tariff** iff its HTS code matches `IEEPA_HTS_PATTERN = /^9903\.01\.\d{2}$/`.
These were struck down by the Supreme Court on Feb 20, 2026, so they are refund-eligible.

- `lineItems` returned = IEEPA items **with `dutyAmount > 0`** only.
- `totalRefundAmount` = sum of those items' duty amounts.
- `isEligible` = `lineItems.length > 0`.
- `htsCodesFound` = de-duped list of eligible HTS codes.

Do not change the pattern or these definitions without explicit instruction — they define the product.

## Why the parsing is brittle (read before touching a regex)

`pdf-parse` returns text with **columns concatenated without spaces**, so every extractor is positional:

- `HTS_LINE_REGEX` — matches an HTS code at line start (8-digit `99XX.XX.XX` chapter-99 codes OR 10-digit
  `XXXX.XX.XXXX` product codes). Fee lines starting `499`/`501` are skipped explicitly.
- `LAST_AMOUNT_REGEX` — the duty amount is **always the last `X,XXX.XX` decimal on the HTS line**.
- `RATE_REGEX` — rate (`NN%` or `Free`) is the last rate token before the amount. Note the `010%` → `10%`
  cleanup: a leading entered-value `0` concatenates onto the rate; the fix strips leading zeros but must
  NOT mangle legitimate fractional rates like `0.125%`.
- `extractDescription` walks up to 4 lines back, skipping C-codes (`C14000`), the lone `N` relationship
  marker, invoice/bill headers, and column headers, then strips a leading 3-digit line number.
- `IEEPA_CODE_DESCRIPTIONS` is the fallback description map for known 9903.01.XX codes.

Validation: the PDF must contain `ENTRY SUMMARY` or `CBP Form 7501`, else `parseEntrySummary` throws.

Header-field extractors (`extractEntryNumber`, `extractEntryDate`, `extractCountryOfOrigin`,
`extractTotalEnteredValue`, `extractFilerCode`) all key off the entry-number row format
`[A-Z0-9]{3}-\d{7}-\d`. Filer code = first 3 chars of the entry number.

## How to change a regex safely

1. Dump the raw text for a failing sample first — do not guess at layout:
   ```js
   import pdf from 'pdf-parse';
   import fs from 'fs';
   const { text } = await pdf(fs.readFileSync('.claude/temp/example-entry-summaries/<file>.pdf'));
   console.log(text);
   ```
2. Adjust the narrowest regex/branch that fixes the case.
3. Re-run `parseEntrySummary` across **all** PDFs in `.claude/temp/example-entry-summaries/` (there are
   60+) and confirm no regression in `totalRefundAmount` / `htsCodesFound`. Use a throwaway script under
   `.claude/temp/workspace/` per `.claude/rules/test-files.md` (arrow fns, thin wrapper, `[N/total]`).

## Persistence (upload.js)

- Dedup by SHA-256 `upload_hash` of the file bytes — a repeat upload returns the existing row with
  `duplicate: true` (no re-insert). Preserve this.
- Insert one `entry_summaries` row (`status` = `eligible` / `not_eligible`, `hts_codes_found` JSON,
  `raw_extracted_text` truncated to 50 000 chars) + one `tariff_line_items` row per eligible item, then
  bump `site_stats` counters (`total_entries_processed`, and on eligible: `eligible_entries`,
  `total_refund_amount`). Stats failures are swallowed — don't let them fail the upload.
- Always `fs.unlinkSync(file.filepath)` after processing. Never echo `raw_extracted_text` in responses.

## Response shape (keep stable — `components/RefundResults.jsx` consumes it)

`{ id, entryNumber, entryDate, countryOfOrigin, totalEnteredValue, isEligible, totalRefundAmount,`
`htsCodesFound, lineItems: [{ htsCode, dutyAmount, rate, description }] }`.
