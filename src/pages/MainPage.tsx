import { useEffect } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { useQRFrame } from '../hooks/useQRFrame'
import { useCamera } from '../hooks/useCamera'
import { useQRScanner } from '../hooks/useQRScanner'
import { useLatency } from '../hooks/useLatency'
import CameraPreview from '../components/CameraPreview'
import StatsPanel from '../components/StatsPanel'
import InfoPanel from '../components/InfoPanel'
import styles from './MainPage.module.css'

export default function MainPage() {
  const { qrValue, renderOffsetRef, frameId, displayFps } = useQRFrame()
  const { videoRef, devices, deviceId, setDeviceId } = useCamera()
  const { result, isTracking, cameraFps } = useQRScanner(videoRef)
  const { samples, totalCount, addScan, reset } = useLatency(renderOffsetRef)

  useEffect(() => {
    if (result) addScan(result)
  }, [result, addScan])

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

      <div className={styles.overlayTopLeft}>
        <InfoPanel frameId={frameId} displayFps={displayFps} cameraFps={cameraFps} />
      </div>

      <div className={styles.overlayLeft}>
        <StatsPanel samples={samples} totalCount={totalCount} onReset={reset} />
      </div>

      <div className={styles.overlayRight}>
        <CameraPreview
          videoRef={videoRef}
          devices={devices}
          deviceId={deviceId}
          onDeviceChange={setDeviceId}
          isTracking={isTracking}
        />
      </div>
    </div>
  )
}
