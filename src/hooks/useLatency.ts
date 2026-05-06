import { useCallback, useRef, useState } from 'react'
import type { ScanResult } from './useQRScanner'

export function useLatency(renderOffsetRef: React.RefObject<number>) {
  const [samples, setSamples] = useState<number[]>([])
  const lastFrameRef = useRef(-1)

  const addScan = useCallback((result: ScanResult) => {
    const { payload, decodeDuration, scannedAt } = result

    if (payload.frame <= lastFrameRef.current) return
    lastFrameRef.current = payload.frame

    // Subtract both the QR decode time and the measured React render overhead.
    // renderOffset ≈ time from rAF callback to useLayoutEffect (≈ actual paint).
    const renderOffset = renderOffsetRef.current ?? 0
    const corrected = scannedAt - payload.ts - renderOffset - decodeDuration
    if (corrected <= 0) return

    setSamples(prev => [...prev, corrected])
  }, [renderOffsetRef])

  const reset = useCallback(() => {
    setSamples([])
    lastFrameRef.current = -1
  }, [])

  return { samples, addScan, reset }
}
