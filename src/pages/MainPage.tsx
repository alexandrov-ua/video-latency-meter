import { QRCodeCanvas } from 'qrcode.react'
import { useQRFrame } from '../hooks/useQRFrame'
import { useCamera } from '../hooks/useCamera'
import { useLatency } from '../hooks/useLatency'
import CameraPreview from '../components/CameraPreview'
import StatsPanel from '../components/StatsPanel'
import styles from './MainPage.module.css'

export default function MainPage() {
  const { qrValue, renderOffsetRef } = useQRFrame()
  const { videoRef, devices, deviceId, setDeviceId } = useCamera()
  const { samples, addScan, reset } = useLatency(renderOffsetRef)

  return (
    <div className={styles.page}>
      <div className={styles.qrWrapper}>
        <QRCodeCanvas
          value={qrValue}
          size={1024}
          className={styles.qr}
          marginSize={4}
        />
      </div>

      <div className={styles.overlayLeft}>
        <StatsPanel samples={samples} onReset={reset} />
      </div>

      <div className={styles.overlayRight}>
        <CameraPreview
          videoRef={videoRef}
          devices={devices}
          deviceId={deviceId}
          onDeviceChange={setDeviceId}
          onScan={addScan}
        />
      </div>
    </div>
  )
}
