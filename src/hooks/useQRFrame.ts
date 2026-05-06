import { useEffect, useLayoutEffect, useRef, useState } from 'react'

export interface QRPayload {
  frame: number
  ts: number
}

export function encodeQRPayload(payload: QRPayload): string {
  // Pad frame to 4 digits minimum — keeps payload ≥ 18 bytes, which locks the
  // QR at Version 2 (25×25) from the very first frame instead of starting at
  // Version 1 (21×21) and growing after ~16 s.
  return `${String(payload.frame).padStart(4, '0')}|${payload.ts}`
}

export function decodeQRPayload(raw: string): QRPayload | null {
  const parts = raw.split('|')
  if (parts.length !== 2) return null
  const frame = parseInt(parts[0], 10)
  const ts = parseInt(parts[1], 10)
  if (isNaN(frame) || isNaN(ts)) return null
  return { frame, ts }
}

export function useQRFrame() {
  const [qrValue, setQrValue] = useState<string>(() =>
    encodeQRPayload({ frame: 0, ts: Date.now() })
  )
  const [frameId, setFrameId] = useState(0)
  const [displayFps, setDisplayFps] = useState(0)
  const frameRef = useRef(0)
  const rafRef = useRef(0)
  const rafCallbackTsRef = useRef(Date.now())
  const renderOffsetRef = useRef(0)

  useEffect(() => {
    let fpsCount = 0
    let fpsWindowStart = performance.now()

    function tick(timestamp: DOMHighResTimeStamp) {
      frameRef.current += 1
      fpsCount++

      if (timestamp - fpsWindowStart >= 1000) {
        setDisplayFps(Math.round(fpsCount * 1000 / (timestamp - fpsWindowStart)))
        fpsCount = 0
        fpsWindowStart = timestamp
      }

      rafCallbackTsRef.current = Date.now()
      const next = encodeQRPayload({ frame: frameRef.current, ts: rafCallbackTsRef.current })
      setQrValue(next)
      setFrameId(frameRef.current)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  useLayoutEffect(() => {
    const offset = Date.now() - rafCallbackTsRef.current
    if (offset >= 0 && offset < 500) {
      renderOffsetRef.current = renderOffsetRef.current * 0.9 + offset * 0.1
    }
  }, [qrValue])

  return { qrValue, renderOffsetRef, frameId, displayFps }
}
