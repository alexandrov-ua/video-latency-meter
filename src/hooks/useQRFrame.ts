import { useEffect, useRef, useState } from 'react'

export interface QRPayload {
  frame: number
  ts: number
}

export function encodeQRPayload(payload: QRPayload): string {
  return `${payload.frame}|${payload.ts}`
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
  const rafRef = useRef<number>(0)

  useEffect(() => {
    function tick() {
      frameRef.current += 1
      setQrValue(encodeQRPayload({ frame: frameRef.current, ts: Date.now() }))
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return qrValue
}
