import { useSearchParams } from 'react-router-dom'
import { useDelayedCamera } from '../hooks/useDelayedCamera'
import styles from './TestPage.module.css'

export default function TestPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const delay = Math.max(0, Number(searchParams.get('delay') ?? 0))

  const { videoRef, canvasRef } = useDelayedCamera(delay)

  function setDelay(ms: number) {
    setSearchParams({ delay: String(ms) }, { replace: true })
  }

  return (
    <div className={styles.page}>
      {/* Hidden video element drives the capture loop */}
      <video ref={videoRef} style={{ display: 'none' }} playsInline muted />

      <canvas ref={canvasRef} className={styles.canvas} />

      <div className={styles.controls}>
        <span className={styles.label}>Delay</span>
        <input
          type="range"
          min={0}
          max={2000}
          step={10}
          value={delay}
          onChange={e => setDelay(Number(e.target.value))}
          className={styles.slider}
        />
        <span className={styles.value}>{delay} ms</span>
      </div>
    </div>
  )
}
