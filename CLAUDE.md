# Video Latency Meter — Claude Code Guide

## What this project does

A web app that measures glass-to-glass latency of video systems (FPV, live cameras, etc.). It shows a QR code on screen, captures it through the video system under test using a webcam, decodes the QR, and computes the round-trip delay.

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
    useQRFrame.ts        # rAF loop that updates QR value every frame; exports encode/decode helpers
    useCamera.ts         # getUserMedia + device enumeration (iOS-safe: enumerates after stream)
    useQRScanner.ts      # rAF loop that decodes QR from video frames via jsqr
    useLatency.ts        # accumulates corrected latency samples; exports reset()
    useDelayedCamera.ts  # frame-buffer camera with configurable artificial delay (test page)
  components/
    CameraPreview.tsx    # small video preview, camera selector, green/red status dot
    StatsPanel.tsx       # min/avg/max + P10/P50/P90 panel with reset button
  pages/
    MainPage.tsx         # main screen: large QR + CameraPreview overlay + StatsPanel overlay
    TestPage.tsx         # /test page: full-screen delayed camera feed + delay slider
  utils/
    stats.ts             # pure functions: computeStats(), percentile()
```

## Key architectural decisions

**QR payload format** is `{frame}|{timestamp}` (e.g. `42|1746441234567`). Kept short so the QR stays low-complexity and scans faster than JSON would.

**Corrected latency formula:**
```
corrected = scannedAt - payload.ts - decodeDuration
```
`scannedAt` is `Date.now()` captured immediately after jsqr returns. `decodeDuration` is subtracted because decoding happened after the frame was captured — this removes the decoder's own processing time from the measurement.

**Frame sequence validation** in `useLatency`: frames with a number ≤ the last seen are silently dropped (handles duplicates and backwards reads from a stuttering video system).

**iOS camera enumeration**: `getUserMedia` must be called first to get permission, then `enumerateDevices()` returns labelled device entries. Skipping this order gives unlabelled or empty results on iOS Safari.

**Test page delay** (`/test?delay=300`): implemented via a frame buffer of `ImageData` objects. Each rAF tick captures the live frame and renders the most recent frame that is ≥ `delayMs` old. Cover-scaling is done via an intermediate canvas because `putImageData` doesn't support scaling.

## Known issues / next tasks

See `tasks.md`. Task 8 is the most important open item: the app currently over-reports latency by ~150–250 ms because `payload.ts` is stamped at the rAF callback time, not at actual screen paint time.
