## Issue

The current implementation generates the QR via `QRCode.toCanvas` → `canvas.toDataURL` → `doc.addImage`. If any step in that chain silently fails in the Vite/browser environment (CJS/ESM interop, canvas-tainting, or `addImage` rejecting the data URL), the PDF saves without a QR but no visible error reaches the user.

## Fix

Replace the image-based QR with a **vector QR drawn directly into the PDF**. `qrcode.create(text, opts)` returns a module bit-matrix — we draw a black `rect` for each "on" module. This bypasses canvas, data-URLs, and `addImage` entirely, so nothing can fail silently.

### Change in `src/lib/citizen/licensePdf.ts`

Replace the `try { … toCanvas … addImage … }` block with:

```ts
const verifyUrl = `${VERIFY_BASE}${encodeURIComponent(licenseNo)}`;
const qrSize = 110;
const qrX = W - 40 - qrSize;
const qrY = 170;

// White background tile
doc.setFillColor("#ffffff");
doc.rect(qrX, qrY, qrSize, qrSize, "F");

try {
  const qr = QRCode.create(verifyUrl, { errorCorrectionLevel: "M" });
  const modules = qr.modules;            // BitMatrix { size, data: Uint8Array }
  const n = modules.size;
  const cell = qrSize / n;
  doc.setFillColor("#000000");
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (modules.get(r, c)) {
        doc.rect(qrX + c * cell, qrY + r * cell, cell + 0.2, cell + 0.2, "F");
      }
    }
  }
} catch (e) {
  console.error("QR generation failed:", e);
  doc.setDrawColor(BORDER);
  doc.rect(qrX, qrY, qrSize, qrSize);
  doc.text("QR unavailable", qrX + qrSize / 2, qrY + qrSize / 2, { align: "center" });
}
```

The `+ 0.2` overlap removes hairline gaps between modules at the PDF's vector resolution.

### Verify

After the edit, in build mode I'll:
1. Run a Node script that imports the same `licensePdf.ts` logic to emit a sample PDF
2. Convert with `pdftoppm` and visually inspect the top-right corner for the QR
3. Decode it (or visually confirm it's a valid QR pattern) before declaring done

## Out of scope

- No other PDF layout changes
- No package swaps — keep `qrcode` and `jspdf`
