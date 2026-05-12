# Video Latency Meter

A web app that measures **glass-to-glass latency** of video systems — FPV drones, live streaming setups, capture cards, video conferencing, anything where you want to know the actual end-to-end delay from reality to display.

## How it works

1. The app displays a QR code on your monitor. The QR encodes the current frame number and timestamp.
2. You point a webcam at your video system's output (e.g. a monitor showing an FPV feed, or a TV showing a video call).
3. The webcam captures the QR, the app decodes it, and computes how long ago that frame was rendered.
4. Latency samples accumulate in real time, showing min/avg/max and percentile statistics.

The measurement is corrected for three sources of systematic error: React render pipeline overhead, webcam hardware capture timing (via `requestVideoFrameCallback`), and any remaining apparatus offset you calibrate out.

## Routes

| Path | Description |
|------|-------------|
| `/` | Main measurement screen |
| `/test?delay=300` | Full-screen delayed camera preview for verifying accuracy (0–2000 ms slider) |

## Usage

### Basic measurement

1. Open the app on the device whose display you want to measure through.
2. Point a webcam at the output display of the video system under test.
3. Wait for the green dot (QR lock acquired). Latency samples start appearing immediately.
4. Read off the P50 value as your typical latency.

### Calibration (recommended)

Calibration removes apparatus offset — monitor input lag, residual decoder overhead, etc.

1. Point the webcam directly at your computer's screen (no video system in between).
2. Wait for ~10 samples to accumulate.
3. Press **Calibrate** in the stats panel. The P50 of the current samples becomes the baseline.
4. Now redirect the webcam through your video system. All readings will have the baseline subtracted.
5. Click the green badge to clear the calibration.

### Camera selection

If multiple cameras are detected, a dropdown appears under the preview. On iOS, cameras are enumerated after permission is granted.

## Running locally

```bash
npm install
npm run dev      # http://localhost:5173
```

```bash
npm run build    # production build → dist/
npm run preview  # serve dist/ locally
```

## Deployment

The app is deployed to GitHub Pages via GitHub Actions on every push to `main`. The workflow sets `VITE_BASE_URL` to the repository subpath and copies `index.html` → `404.html` for SPA routing.

## Stack

- Vite + React + TypeScript
- [qrcode.react](https://github.com/zpao/qrcode.react) — QR generation
- [jsqr](https://github.com/cozmo/jsQR) — QR decoding
- react-router-dom
