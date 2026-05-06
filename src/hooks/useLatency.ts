import { useCallback, useRef, useState } from 'react'
import type { ScanResult } from './useQRScanner'

export function useLatency(renderOffsetRef: React.RefObject<number>) {
  const [samples, setSamples] = useState<number[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const lastFrameRef = useRef(-1)

  const addScan = useCallback((result: ScanResult) => {
    const { payload, decodeDuration, scannedAt } = result

    if (payload.frame <= lastFrameRef.current) return
    lastFrameRef.current = payload.frame

    const renderOffset = renderOffsetRef.current ?? 0
    const corrected = scannedAt - payload.ts - renderOffset - decodeDuration
    if (corrected <= 0) return

    setTotalCount(n => n + 1)
    setSamples(prev => {
      const next = [...prev, corrected]
      return next.length > 300 ? next.slice(-300) : next
    })
  }, [renderOffsetRef])

  const reset = useCallback(() => {
    setSamples([])
    setTotalCount(0)
    lastFrameRef.current = -1
  }, [])

  return { samples, totalCount, addScan, reset }
}
