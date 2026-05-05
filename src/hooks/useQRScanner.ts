import { useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'
import { decodeQRPayload } from './useQRFrame'
import type { QRPayload } from './useQRFrame'

export interface ScanResult {
  payload: QRPayload
  decodeDuration: number
  scannedAt: number  // Date.now() captured immediately after jsqr finishes
}

const MAX_SCAN_WIDTH = 640

export function useQRScanner(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const [result, setResult] = useState<ScanResult | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const isTrackingRef = useRef(false)
  const lastSuccessRef = useRef(0)
  const rafRef = useRef(0)

  useEffect(() => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!

    function scan() {
      const video = videoRef.current
      if (video && video.readyState >= video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
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
            const scannedAt = Date.now()
            lastSuccessRef.current = scannedAt
            setResult({ payload, decodeDuration, scannedAt })
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
    return () => cancelAnimationFrame(rafRef.current)
  }, [videoRef])

  return { result, isTracking }
}
