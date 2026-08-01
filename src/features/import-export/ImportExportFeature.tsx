import React, { useRef } from 'react'
import { Download, Upload } from 'lucide-react'
import { useDnsStore } from '../../store/useDnsStore'
import { useSettingsStore } from '../../store/useSettingsStore'
import { useLogStore } from '../../store/useLogStore'
import { useI18n } from '../../hooks/useI18n'

export const ImportExportFeature: React.FC = () => {
  const { servers, importServers } = useDnsStore()
  const { setAutoStartOnBoot, setAutoReconnect, setLng, setTheme } = useSettingsStore()
  const addLog = useLogStore((s) => s.addLog)
  const { t } = useI18n()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    try {
      const customServers = servers.filter((s) => s.isCustom)
      const exportData = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        customServers,
        settings: useSettingsStore.getState()
      }
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `dnschanger-backup-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
      addLog('success', 'Exported settings and custom DNS list successfully')
    } catch (err: any) {
      addLog('error', `Export failed: ${err?.message || err}`)
    }
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string
        const parsed = JSON.parse(content)

        if (parsed.customServers && Array.isArray(parsed.customServers)) {
          importServers(parsed.customServers)
        }

        if (parsed.settings) {
          if (typeof parsed.settings.autoStartOnBoot === 'boolean') {
            setAutoStartOnBoot(parsed.settings.autoStartOnBoot)
          }
          if (typeof parsed.settings.autoReconnect === 'boolean') {
            setAutoReconnect(parsed.settings.autoReconnect)
          }
          if (parsed.settings.lng) setLng(parsed.settings.lng)
          if (parsed.settings.theme) setTheme(parsed.settings.theme)
        }

        addLog('success', 'Imported settings and custom DNS list successfully')
      } catch (err: any) {
        addLog('error', `Import failed: ${err?.message || err}`)
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="bg-base-100 border border-base-300 rounded-2xl p-4 shadow-sm space-y-3">
      <h4 className="font-bold text-sm text-base-content">Backup & Restore</h4>
      <div className="flex gap-2">
        <button
          onClick={handleExport}
          className="btn btn-outline btn-sm flex-1 rounded-xl gap-2 text-xs"
        >
          <Download className="w-4 h-4" />
          <span>{t('export')}</span>
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn btn-outline btn-sm flex-1 rounded-xl gap-2 text-xs"
        >
          <Upload className="w-4 h-4" />
          <span>{t('import')}</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
      </div>
    </div>
  )
}
