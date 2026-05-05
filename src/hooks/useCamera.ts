import { useEffect, useRef, useState } from 'react'

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [deviceId, setDeviceId] = useState<string>('')

  useEffect(() => {
    let cancelled = false

    async function start() {
      streamRef.current?.getTracks().forEach(t => t.stop())

      const constraints: MediaStreamConstraints = deviceId
        ? { video: { deviceId: { exact: deviceId } } }
        : { video: { facingMode: { ideal: 'environment' } } }

      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return }

        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(() => {})
        }

        // Enumerate after acquiring permission — required on iOS
        const all = await navigator.mediaDevices.enumerateDevices()
        if (!cancelled) {
          setDevices(all.filter(d => d.kind === 'videoinput'))
        }
      } catch (err) {
        console.error('Camera access failed:', err)
      }
    }

    start()

    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
  }, [deviceId])

  return { videoRef, devices, deviceId, setDeviceId }
}
