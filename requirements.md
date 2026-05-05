# Video Latency Meter

## General

An app intended to measure glass-to-glass latency in different video systems, such as FPV video systems or any video system that displays live camera footage. The main idea is to show a QR code on the screen — this QR code is shown to the camera of the video system, which renders it, and then we capture it via our camera (web camera of the PC or mobile camera). By parsing the QR code we can calculate the latency. It should be a web app so it can run on both mobile and PC. The main platform is iOS.

## Main Screen

- **Big QR code.** Contains the frame number and the timestamp.
- **Small window** with the video captured by the web camera, including:
  - Ability to select the web camera (on iOS it is important to support selection between the front camera and multiple back cameras)
  - Status indicator showing whether the app is able to parse the QR code
- **Measurements panel** with the following fields:
  - Min / Max / Average latency
  - Distribution percentiles: 10th / 50th / 90th

## Latency Measurement

Show QR with timestamp → get video from web camera → parse QR → latency is the difference between the current system timestamp and the timestamp extracted from the QR code.

On the main page, the QR code should be updated as fast as possible (ideally on each frame the monitor can display) to minimize measurement error.

In the final calculation, the time taken to parse the QR code should be accounted for.

Each QR code should contain the frame number and the timestamp so we can be sure that we are calculating latency between sequential frames.

For the future, we should consider a calibration procedure to further minimize measurement error.

## Test Page

To be able to verify the app, we will need a separate page (openable on another laptop) that shows video from the camera with the ability to set an artificial delay.

For example:
```
www.site.com/test?delay=30
```

*Delay should be in milliseconds (ms).*

## Technical Requirements

- Must be a web app. Main platform is iOS, but it should also work on PC.
- TypeScript, React
- QR code parsing should be as fast as possible

## Future / Out of Scope

- Ability to store measurements in local storage with a user-defined name (e.g. "90 fps, before improvements")