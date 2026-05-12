# Video Latency Meter — Claude Code Guide

## What this project does

A web app that measures glass-to-glass latency of video systems (FPV drones, live cameras, etc.). It displays a QR code on screen, captures it through the video system under test using a webcam, decodes the QR, and computes the round-trip delay with systematic error correction.

## Stack

- **Vite + React + TypeScript**
- **qrcode.react** — QR code generation
- **jsqr** — QR code decoding from camera frames
- **react-router-dom** — two routes: `/` (main) and `/test`

## Commands

```bash
npm run dev      # dev server at http://localhost:5173
npm run build    # production build → dist/
npm run preview  # serve dist/ locally
```

## Project structure

```
src/
  hooks/
    useQRFrame.ts        # rAF loop that updates QR value every frame; tracks display FPS; EMA render offset
    useCamera.ts         # getUserMedia + device enumeration (iOS-safe: enumerates after stream)
    useQRScanner.ts      # rAF loop that decodes QR via jsqr; uses requestVideoFrameCallback for captureTime
    useLatency.ts        # accumulates corrected latency samples (rolling 300); exports reset()
    useDelayedCamera.ts  # frame-buffer camera with configurable artificial delay (test page)
  components/
    CameraPreview.tsx    # small video preview, camera selector, green/red status dot; receives isTracking as prop
    StatsPanel.tsx       # min/avg/max + P10/P50/P90 panel; calibration via localStorage; reset button
    InfoPanel.tsx        # top-left panel: frame number, display Hz, camera fps
  pages/
    MainPage.tsx         # main screen: large QR + InfoPanel + StatsPanel + CameraPreview overlays
    TestPage.tsx         # /test page: full-screen delayed camera feed + delay slider
  utils/
    stats.ts             # pure functions: computeStats(), percentile()
```

## Key architectural decisions

**QR payload format** is `{frame}|{timestamp}` (e.g. `0042|1746441234567`). Frame is zero-padded to 4 digits so the QR stays locked at Version 2 (25×25 modules) from the very first frame. This keeps scan speed consistent — a growing QR becomes harder to scan at oblique angles.

**Three-layer latency correction:**

1. **Render offset EMA** (`useQRFrame` + `useLayoutEffect`): measures the time between the rAF callback and React finishing the paint (typically 10–40 ms). Stored in `renderOffsetRef` and subtracted from every sample.
2. **requestVideoFrameCallback captureTime** (`useQRScanner`): when available, uses the hardware timestamp of the frame capture rather than `Date.now()` after decoding — removes webcam pipeline latency. Converted to wall clock via `captureTime + (Date.now() - performance.now())`.
3. **Calibration** (`StatsPanel`): user points camera directly at screen to measure apparatus-only offset (monitor lag, remaining decoder overhead, etc.). Baseline stored in `localStorage` key `vlm-baseline`; all displayed stats subtract it.

**Corrected latency formula** (when captureTime not available):
```
corrected = scannedAt - payload.ts - renderOffset - decodeDuration
```
When captureTime is available: `corrected = captureTimeMs - payload.ts - renderOffset` (decodeDuration term drops because captureTime is the actual capture moment).

**Frame sequence validation** in `useLatency`: frames with a number ≤ the last seen are silently dropped (handles duplicates and backwards reads from a stuttering video system).

**Rolling sample window**: last 300 samples kept in state; `totalCount` tracks the cumulative count across the session for display as "1250 samples (300)".

**iOS camera enumeration**: `getUserMedia` must be called first to get permission, then `enumerateDevices()` returns labelled device entries. Skipping this order gives unlabelled or empty results on iOS Safari.

**Test page delay** (`/test?delay=300`): implemented via a frame buffer of `ImageData` objects. Each rAF tick captures the live frame and renders the most recent frame that is ≥ `delayMs` old. Cover-scaling is done via an intermediate canvas because `putImageData` doesn't support scaling.

**GitHub Pages deployment**: `vite.config.ts` reads `VITE_BASE_URL` env var for the base path. `BrowserRouter` uses `basename={import.meta.env.BASE_URL}`. The workflow copies `dist/index.html` → `dist/404.html` so the static host serves the SPA for unknown paths.

**CSS safe-area-insets**: all overlays use `env(safe-area-inset-*)` with `max()` fallbacks so nothing is hidden behind iOS notch or home indicator. `viewport-fit=cover` is set in `index.html`.

## Known issues

All planned tasks are complete. No open known issues.
