import { useMemo, useState } from 'react'
import { computeStats } from '../utils/stats'
import styles from './StatsPanel.module.css'

interface Props {
  samples: number[]
  onReset: () => void
}

function fmt(ms: number) {
  return Math.max(0, ms).toFixed(1)
}

function readStoredBaseline(): number {
  try { return Number(localStorage.getItem('vlm-baseline') ?? '0') } catch { return 0 }
}

export default function StatsPanel({ samples, onReset }: Props) {
  const [baseline, setBaseline] = useState(readStoredBaseline)

  const raw = useMemo(() => computeStats(samples), [samples])

  const stats = useMemo(() => {
    if (!raw || baseline === 0) return raw
    return {
      ...raw,
      min: raw.min - baseline,
      avg: raw.avg - baseline,
      max: raw.max - baseline,
      p10: raw.p10 - baseline,
      p50: raw.p50 - baseline,
      p90: raw.p90 - baseline,
    }
  }, [raw, baseline])

  function handleSetBaseline() {
    if (!raw || raw.count < 5) return
    try { localStorage.setItem('vlm-baseline', String(raw.p50)) } catch {}
    setBaseline(raw.p50)
  }

  function handleClearBaseline() {
    try { localStorage.removeItem('vlm-baseline') } catch {}
    setBaseline(0)
  }

  function handleReset() {
    onReset()
  }

  const canCalibrate = raw !== null && raw.count >= 5

  return (
    <div className={styles.panel}>
      <div className={styles.grid}>
        <Stat label="Min" value={stats ? fmt(stats.min) : '—'} unit="ms" />
        <Stat label="Avg" value={stats ? fmt(stats.avg) : '—'} unit="ms" />
        <Stat label="Max" value={stats ? fmt(stats.max) : '—'} unit="ms" />
        <Stat label="P10" value={stats ? fmt(stats.p10) : '—'} unit="ms" />
        <Stat label="P50" value={stats ? fmt(stats.p50) : '—'} unit="ms" />
        <Stat label="P90" value={stats ? fmt(stats.p90) : '—'} unit="ms" />
      </div>
      <div className={styles.footer}>
        <div className={styles.footerTop}>
          <span className={styles.count}>{stats ? `${stats.count} samples` : 'No data'}</span>
          {baseline > 0 && (
            <button className={styles.baselineBadge} onClick={handleClearBaseline}>
              -{baseline.toFixed(0)}ms ✕
            </button>
          )}
        </div>
        <div className={styles.buttons}>
          <button
            className={styles.calibrate}
            onClick={handleSetBaseline}
            disabled={!canCalibrate}
            title="Point camera directly at the screen (no video system), then click to zero out the apparatus latency"
          >
            Calibrate
          </button>
          <button className={styles.reset} onClick={handleReset}>Reset</button>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className={styles.stat}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}<span className={styles.unit}>{value !== '—' ? ` ${unit}` : ''}</span></span>
    </div>
  )
}
