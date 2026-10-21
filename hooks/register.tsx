import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Window } from '../types'

const windows = atom({ plugin: 'usage-meter', key: 'windows' } as const, [] as Window[])

const LABELS: Record<string, string> = {
  five_hour: '5ч',
  seven_day: 'Неделя',
  spend_limit: 'Лимит',
}

const label = (kind: string) => LABELS[kind] ?? kind

const bar = (pct: number, width = 10) => {
  const filled = Math.max(0, Math.min(width, Math.round((pct / 100) * width)))
  return '█'.repeat(filled) + '░'.repeat(width - filled)
}

const untilReset = (iso?: string, now = Date.now()) => {
  if (!iso) return ''
  const ms = new Date(iso).getTime() - now
  if (!(ms > 0)) return ''
  const h = Math.floor(ms / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  return h >= 24 ? ` · сброс ${Math.floor(h / 24)}д ${h % 24}ч` : ` · сброс ${h}ч ${m}м`
}

const line = (w: Window, now: number) => {
  const left = Math.max(0, 100 - w.percentUsed)
  return `${label(w.kind)}: ${w.percentUsed}% исп. / ${Math.round(left * 10) / 10}% осталось`
    + untilReset(w.resetsAt, now)
}

async function refresh($: EngineInterface, list: readonly Window[]) {
  const copy = list.map(w => ({ kind: w.kind, percentUsed: w.percentUsed, resetsAt: w.resetsAt }))
  await update($, windows, () => copy)
  const now = await $.clock.now()
  $.ui.status(copy.length ? copy.map(w => line(w, now)).join('  |  ') : undefined)
  for (const w of copy) {
    if (w.percentUsed >= 90) $.ui.toast(`${label(w.kind)}: осталось ${Math.max(0, 100 - w.percentUsed)}%`)
  }
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const r = await next(e)
    const u = await $.session.usage()
    await refresh($, u.rateLimits)
    return r
  })

  on('session.measure', async ($, e, next) => {
    if (e.changed.includes('rateLimits')) await refresh($, e.rateLimits)
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const list = await read($, windows)
    if (e.props.hasSurvey || list.length === 0) return next(e)
    const { Box, Text } = $.ui.resolve(e)
    const now = await $.clock.now()
    return (
      <Box flexDirection="column">
        {list.map(w => (
          <Text key={w.kind} dimColor={w.percentUsed < 75} color={w.percentUsed >= 90 ? 'red' : w.percentUsed >= 75 ? 'yellow' : undefined}>
            {`${label(w.kind).padEnd(7)} ${bar(w.percentUsed)} ${line(w, now).split(': ')[1]}`}
          </Text>
        ))}
      </Box>
    )
  })
}
