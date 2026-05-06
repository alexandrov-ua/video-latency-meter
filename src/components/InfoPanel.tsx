import styles from './InfoPanel.module.css'

interface Props {
  frameId: number
  displayFps: number
  cameraFps: number
}

export default function InfoPanel({ frameId, displayFps, cameraFps }: Props) {
  return (
    <div className={styles.panel}>
      <Row label="Frame"   value={frameId.toString()} />
      <Row label="Display" value={displayFps > 0 ? `${displayFps} Hz` : '—'} />
      <Row label="Camera"  value={cameraFps > 0  ? `${cameraFps} fps` : '—'} />
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.row}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
    </div>
  )
}
