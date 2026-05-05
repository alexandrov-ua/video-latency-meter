import { useEffect, useRef } from 'react'

interface Frame {
  ts: number
  data: ImageData
}

export function useDelayedCamera(delayMs: number) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const delayRef = useRef(delayMs)
  delayRef.current = delayMs

  // Camera stream
  useEffect(() => {
    let cancelled = false
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: 'environment' } } })
      .then(stream => {
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return }
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(() => {})
        }
      })
      .catch(err => console.error('Camera error:', err))
    return () => {
      cancelled = true
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop())
      }
    }
  }, [])

  // Frame buffer + delayed display loop
  useEffect(() => {
    // captureCanvas: video resolution, for reading pixels
    const captureCanvas = document.createElement('canvas')
    const captureCtx = captureCanvas.getContext('2d', { willReadFrequently: true })!
    // frameCanvas: intermediate canvas used to scale ImageData onto the display canvas
    const frameCanvas = document.createElement('canvas')
    const frameCtx = frameCanvas.getContext('2d')!
    const buffer: Frame[] = []
    let rafId = 0

    function tick() {
      const video = videoRef.current
      const display = canvasRef.current
      if (video && display && video.readyState >= video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
        const vw = video.videoWidth
        const vh = video.videoHeight

        if (captureCanvas.width !== vw || captureCanvas.height !== vh) {
          captureCanvas.width = vw
          captureCanvas.height = vh
          frameCanvas.width = vw
          frameCanvas.height = vh
        }

        // Sync display canvas to its CSS size (fills the viewport)
        const dw = display.clientWidth
        const dh = display.clientHeight
        if (dw > 0 && dh > 0 && (display.width !== dw || display.height !== dh)) {
          display.width = dw
          display.height = dh
        }

        // Capture current frame into buffer
        captureCtx.drawImage(video, 0, 0, vw, vh)
        buffer.push({ ts: Date.now(), data: captureCtx.getImageData(0, 0, vw, vh) })

        // Find the most recent frame that is at least delayMs old
        const cutoff = Date.now() - delayRef.current
        let frameIdx = -1
        for (let i = buffer.length - 1; i >= 0; i--) {
          if (buffer[i].ts <= cutoff) { frameIdx = i; break }
        }

        if (frameIdx >= 0 && display.width > 0 && display.height > 0) {
          // Blit ImageData onto the intermediate canvas, then scale-to-cover onto display
          frameCtx.putImageData(buffer[frameIdx].data, 0, 0)

          const scale = Math.max(display.width / vw, display.height / vh)
          const scaledW = vw * scale
          const scaledH = vh * scale
          const offsetX = (display.width - scaledW) / 2
          const offsetY = (display.height - scaledH) / 2

          const displayCtx = display.getContext('2d')!
          displayCtx.drawImage(frameCanvas, offsetX, offsetY, scaledW, scaledH)
          buffer.splice(0, frameIdx)
        }
      }

      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [])

  return { videoRef, canvasRef }
}
