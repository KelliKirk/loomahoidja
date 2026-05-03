import { useMemo, useState } from 'react'
import { eachDayInRange } from '../lib/dateRange'

const WEEK = ['E', 'T', 'K', 'N', 'R', 'L', 'P']

function pad2(n) {
  return String(n).padStart(2, '0')
}

function toISO(y, m, d) {
  return `${y}-${pad2(m)}-${pad2(d)}`
}

/** Monday-based weekday index 0..6 */
function mondayIndex(date) {
  return (date.getDay() + 6) % 7
}

export default function CalendarRangePicker({
  yearMonth,
  selectedStart,
  selectedEnd,
  disabledSet,
  onRangeChange,
  onBlockedAttempt,
}) {
  const [anchor, setAnchor] = useState(null)

  const { cells } = useMemo(() => {
    const [y, m] = yearMonth.split('-').map(Number)
    const first = new Date(y, m - 1, 1)
    const lastDay = new Date(y, m, 0).getDate()
    const pad = mondayIndex(first)
    const totalCells = Math.ceil((pad + lastDay) / 7) * 7
    const out = []
    for (let i = 0; i < totalCells; i++) {
      const dayNum = i - pad + 1
      if (dayNum < 1 || dayNum > lastDay) {
        out.push({ type: 'empty', key: `e-${i}` })
      } else {
        const iso = toISO(y, m, dayNum)
        out.push({ type: 'day', key: iso, iso })
      }
    }
    return { cells: out }
  }, [yearMonth])

  function inSelectedRange(iso) {
    if (!selectedStart) return false
    const end = selectedEnd || selectedStart
    return iso >= selectedStart && iso <= end
  }

  function onDayClick(iso) {
    if (disabledSet.has(iso)) {
      onBlockedAttempt?.()
      return
    }

    if (!anchor) {
      setAnchor(iso)
      onRangeChange({ start: iso, end: null })
      return
    }

    let start = anchor
    let end = iso
    if (iso < start) {
      start = iso
      end = anchor
    }

    for (const d of eachDayInRange(start, end)) {
      if (disabledSet.has(d)) {
        onBlockedAttempt?.()
        return
      }
    }

    setAnchor(null)
    onRangeChange({ start, end })
  }

  return (
    <div className="calWrap">
      <div className="calWeekRow">
        {WEEK.map((d) => (
          <div key={d} className="calWeekday">
            {d}
          </div>
        ))}
      </div>
      <div className="calGrid">
        {cells.map((c) => {
          if (c.type === 'empty') return <div key={c.key} className="calCell calCellEmpty" />
          const iso = c.iso
          const dis = disabledSet.has(iso)
          const sel = inSelectedRange(iso)
          const cls = ['calCell', 'calCellDay']
          if (dis) cls.push('calCellDisabled')
          if (sel) cls.push('calCellSelected')
          return (
            <button
              key={c.key}
              type="button"
              className={cls.join(' ')}
              disabled={dis}
              onClick={() => onDayClick(iso)}
            >
              {Number(iso.slice(8, 10))}
            </button>
          )
        })}
      </div>
      <div className="calHint">
        Puudulikud päevad on hõivatud või pole saadaval. Teise kasutaja ajutine broneering lukustab kuupäevad mõneks
        minutiks.
      </div>
    </div>
  )
}
