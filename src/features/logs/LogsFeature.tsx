import React from 'react'
import { Terminal, Trash2, Copy, Check } from 'lucide-react'
import { useLogStore } from '../../store/useLogStore'
import { useI18n } from '../../hooks/useI18n'

export const LogsFeature: React.FC = () => {
  const { logs, clearLogs } = useLogStore()
  const { t } = useI18n()
  const [copied, setCopied] = React.useState(false)

  const handleCopy = () => {
    const text = logs.map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message}`).join('\n')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-base-100 border border-base-300 rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold text-base-content">
          <Terminal className="w-4 h-4 text-primary" />
          <span>{t('logs')}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            disabled={logs.length === 0}
            className="btn btn-ghost btn-xs gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="text-[10px]">{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={clearLogs}
            disabled={logs.length === 0}
            className="btn btn-ghost btn-xs text-error gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="text-[10px]">{t('clearLogs')}</span>
          </button>
        </div>
      </div>

      <div className="bg-base-300 rounded-xl p-3 h-48 overflow-y-auto font-mono text-xs space-y-1">
        {logs.length === 0 ? (
          <div className="text-base-content/40 text-center py-12">No logs recorded yet</div>
        ) : (
          logs.map((log) => {
            const colorClass =
              log.level === 'error'
                ? 'text-error'
                : log.level === 'warn'
                ? 'text-warning'
                : log.level === 'success'
                ? 'text-success'
                : 'text-base-content/80'

            return (
              <div key={log.id} className="leading-tight flex gap-2">
                <span className="text-base-content/40 select-none">[{log.timestamp}]</span>
                <span className={colorClass}>{log.message}</span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
