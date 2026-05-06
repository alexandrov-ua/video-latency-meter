import styles from './CameraPreview.module.css'

interface Props {
  videoRef: React.RefObject<HTMLVideoElement | null>
  devices: MediaDeviceInfo[]
  deviceId: string
  onDeviceChange: (id: string) => void
  isTracking: boolean
}

export default function CameraPreview({ videoRef, devices, deviceId, onDeviceChange, isTracking }: Props) {
  return (
    <div className={styles.container}>
      <div className={styles.videoWrapper}>
        <video
          ref={videoRef}
          className={styles.video}
          autoPlay
          playsInline
          muted
        />
        <span className={`${styles.indicator} ${isTracking ? styles.ok : styles.fail}`} />
      </div>

      {devices.length > 1 && (
        <select
          className={styles.select}
          value={deviceId}
          onChange={e => onDeviceChange(e.target.value)}
        >
          {devices.map(d => (
            <option key={d.deviceId} value={d.deviceId}>
              {d.label || `Camera ${d.deviceId.slice(0, 6)}`}
            </option>
          ))}
        </select>
      )}
    </div>
  )
}
