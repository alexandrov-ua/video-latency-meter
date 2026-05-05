import { useMemo } from 'react'
import { computeStats } from '../utils/stats'
import styles from './StatsPanel.module.css'

interface Props {
  samples: number[]
  onReset: () => void
}

function fmt(ms: number) {
  return ms.toFixed(1)
}

export default function StatsPanel({ samples, onReset }: Props) {
  const stats = useMemo(() => computeStats(samples), [samples])

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
        <span className={styles.count}>{stats ? `${stats.count} samples` : 'No data'}</span>
        <button className={styles.reset} onClick={onReset}>Reset</button>
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
