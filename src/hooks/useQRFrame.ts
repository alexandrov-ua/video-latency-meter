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
  const frameRef = useRef(0)
  const rafRef = useRef(0)
  const rafCallbackTsRef = useRef(Date.now())

  // Running average of the render pipeline overhead:
  //   rAF callback fires → React re-renders → useLayoutEffect fires (≈ paint)
  // This is the systematic gap that inflates every latency reading.
  const renderOffsetRef = useRef(0)

  useEffect(() => {
    function tick() {
      frameRef.current += 1
      rafCallbackTsRef.current = Date.now()
      setQrValue(encodeQRPayload({ frame: frameRef.current, ts: rafCallbackTsRef.current }))
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  // Fires after every QR commit, synchronously before browser paint.
  // Measures how long React took to process the rAF-triggered state update.
  useLayoutEffect(() => {
    const offset = Date.now() - rafCallbackTsRef.current
    if (offset >= 0 && offset < 500) {
      // Exponential moving average (α = 0.1) — stabilises in ~30 frames
      renderOffsetRef.current = renderOffsetRef.current * 0.9 + offset * 0.1
    }
  }, [qrValue])

  return { qrValue, renderOffsetRef }
}
