# Camera Capture for OCR

- OCR card now includes a 📷 camera button alongside the existing 📎 upload button
- Clicking 📷 opens a live camera modal (`getUserMedia`, rear camera by default on mobile)
- Capture → Preview → Retake / Use Photo flow
- Captured images stored as JPEG (0.85 quality, max 1280px wide) and attached via `addUploadFieldsToBlock`
- Falls back to native `<input capture="environment">` on browsers without `getUserMedia`
- Camera modal styled with OCR amber accent theme, dark backdrop, responsive layout, light theme support
- Error toast if camera permission is denied

---

## Files Changed (2 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/ai-docgen.js` | +118 −0 | Camera button on OCR card + `openCameraModal()` function with capture/retake/accept flow |
| `css/ai-docgen.css` | +154 −0 | Camera modal overlay, video, buttons, responsive, light/dark theme |
