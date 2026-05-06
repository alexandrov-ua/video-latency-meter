import { useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'
import { decodeQRPayload } from './useQRFrame'
import type { QRPayload } from './useQRFrame'

export interface ScanResult {
  payload: QRPayload
  // When captureTime is available: scannedAt = camera hardware capture time,
  // decodeDuration = 0 (captureTime is already before decoding).
  // Otherwise: scannedAt = Date.now() after jsqr, decodeDuration = actual ms.
  decodeDuration: number
  scannedAt: number
}

const MAX_SCAN_WIDTH = 640

// performance.now() → Date.now() domain offset, computed once
const perfToDateOffset = Date.now() - performance.now()

export function useQRScanner(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const [result, setResult] = useState<ScanResult | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [cameraFps, setCameraFps] = useState(0)
  const isTrackingRef = useRef(false)
  const lastSuccessRef = useRef(0)
  const rafRef = useRef(0)

  useEffect(() => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!

    let captureTimeMs: number | null = null
    let vfcActive = true
    let vfcSetup = false
    let vfcFrameCount = 0
    let vfcWindowStart = performance.now()

    function setupCaptureTracking(video: HTMLVideoElement) {
      if (!('requestVideoFrameCallback' in video)) return

      const onFrame = (now: DOMHighResTimeStamp, metadata: VideoFrameCallbackMetadata) => {
        if (!vfcActive) return
        if (metadata.captureTime !== undefined) {
          captureTimeMs = metadata.captureTime + perfToDateOffset
        }
        vfcFrameCount++
        if (now - vfcWindowStart >= 1000) {
          setCameraFps(Math.round(vfcFrameCount * 1000 / (now - vfcWindowStart)))
          vfcFrameCount = 0
          vfcWindowStart = now
        }
        video.requestVideoFrameCallback(onFrame)
      }
      video.requestVideoFrameCallback(onFrame)
    }

    function scan() {
      const video = videoRef.current
      if (video && video.readyState >= video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
        // Set up hardware capture-time tracking once the video is playing
        if (!vfcSetup) {
          vfcSetup = true
          setupCaptureTracking(video)
        }

        const scale = Math.min(1, MAX_SCAN_WIDTH / video.videoWidth)
        canvas.width = Math.round(video.videoWidth * scale)
        canvas.height = Math.round(video.videoHeight * scale)
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

        const t0 = performance.now()
        const code = jsQR(imageData.data, imageData.width, imageData.height)
        const decodeDuration = performance.now() - t0

        if (code) {
          const payload = decodeQRPayload(code.data)
          if (payload) {
            // captureTime → scannedAt is when the camera physically captured the
            // frame containing this QR. decodeDuration = 0 because captureTime
            // is already before decoding started. This removes the webcam
            // pipeline latency from the measurement.
            const scannedAt = captureTimeMs ?? Date.now()
            const effectiveDecodeDuration = captureTimeMs != null ? 0 : decodeDuration

            lastSuccessRef.current = Date.now()
            setResult({ payload, decodeDuration: effectiveDecodeDuration, scannedAt })
          }
        }
      }

      const nowTracking = Date.now() - lastSuccessRef.current < 500
      if (nowTracking !== isTrackingRef.current) {
        isTrackingRef.current = nowTracking
        setIsTracking(nowTracking)
      }

      rafRef.current = requestAnimationFrame(scan)
    }

    rafRef.current = requestAnimationFrame(scan)
    return () => {
      cancelAnimationFrame(rafRef.current)
      vfcActive = false
    }
  }, [videoRef])

  return { result, isTracking, cameraFps }
}
