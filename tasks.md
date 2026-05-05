# Video Latency Meter — Tasks

## 1. Project Setup

- [x] 1.1 Scaffold a React + TypeScript project (Vite)
- [x] 1.2 Install core dependencies: QR code generator, QR code scanner/decoder, React Router
- [x] 1.3 Configure routing: `/` (main screen) and `/test` (test page)
- [x] 1.4 Set up basic project structure (`/components`, `/hooks`, `/pages`, `/utils`)

## 2. QR Code Display (Main Screen)

- [x] 2.1 Generate a QR code that encodes `{ frame: number, timestamp: number }`
- [x] 2.2 Update the QR code on every animation frame (`requestAnimationFrame`) to minimize measurement error
- [x] 2.3 Display the QR code as large as possible on the main screen

## 3. Camera Capture & QR Parsing

- [x] 3.1 Access the device camera via `getUserMedia`
- [x] 3.2 Display the camera feed in a small preview window on the main screen
- [x] 3.3 Add a camera selector dropdown (supports front camera, multiple back cameras — critical for iOS)
- [x] 3.4 Continuously decode QR codes from the camera feed as fast as possible
- [x] 3.5 Add a status indicator (e.g. green/red dot) showing whether the QR code is currently being parsed successfully

## 4. Latency Calculation

- [x] 4.1 On each successful QR decode, compute raw latency: `Date.now() - qr.timestamp`
- [x] 4.2 Subtract the QR decode duration from the raw latency to get the corrected latency
- [x] 4.3 Verify sequential frames using the frame number (skip/flag out-of-order reads)
- [x] 4.4 Accumulate a rolling history of corrected latency samples

## 5. Measurements Panel

- [x] 5.1 Display Min / Max / Average latency (updated live)
- [x] 5.2 Display distribution percentiles: P10 / P50 / P90 (updated live)
- [x] 5.3 Add a "Reset" button to clear the measurement history

## 6. Test Page (`/test`)

- [x] 6.1 Create the `/test` route and page
- [x] 6.2 Access the device camera and display the live feed
- [x] 6.3 Read the `delay` query parameter (e.g. `/test?delay=300`, value in ms)
- [x] 6.4 Introduce the artificial delay before rendering each video frame
- [x] 6.5 Display the current active delay value on the page

## 7. Polish & iOS Compatibility

- [x] 7.1 Ensure the app is fully usable on iOS Safari (camera permissions, `getUserMedia` constraints)
- [x] 7.2 Make the layout responsive for both mobile and desktop
- [x] 7.3 Test camera selection on iOS (front camera + multiple back cameras)
- [x] 7.4 Verify QR decode performance meets real-time requirements on a mid-range mobile device

## 8. Fix Measurement Offset

The app currently over-reports latency by ~150–250 ms. The likely cause is that `payload.ts` is stamped at the `requestAnimationFrame` callback time, but the QR code doesn't actually appear on screen until the browser composites and paints the frame — which happens several milliseconds later. This systematic offset inflates every measurement.

- [ ] 8.1 Investigate the gap between rAF callback and actual screen paint (e.g. using `requestAnimationFrame` timestamp vs `Date.now()`)
- [ ] 8.2 Investigate whether display refresh delay (double-buffering, vsync) contributes to the offset
- [ ] 8.3 Implement a correction strategy (e.g. stamp the QR with `performance.now()` at paint time using a commit-phase trick, or subtract a calibrated screen-render offset)
- [ ] 8.4 Verify the fix using the `/test` page with a known artificial delay
