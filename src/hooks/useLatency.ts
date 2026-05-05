import { useCallback, useRef, useState } from 'react'
import type { ScanResult } from './useQRScanner'

export function useLatency() {
  const [samples, setSamples] = useState<number[]>([])
  const lastFrameRef = useRef(-1)

  const addScan = useCallback((result: ScanResult) => {
    const { payload, decodeDuration, scannedAt } = result

    // Skip duplicate or out-of-order frames
    if (payload.frame <= lastFrameRef.current) return
    lastFrameRef.current = payload.frame

    // correctedLatency = time from QR generation to frame capture
    // frame capture happened ~decodeDuration ms before scannedAt
    const corrected = scannedAt - payload.ts - decodeDuration
    if (corrected <= 0) return

    setSamples(prev => [...prev, corrected])
  }, [])

  const reset = useCallback(() => {
    setSamples([])
    lastFrameRef.current = -1
  }, [])

  return { samples, addScan, reset }
}
