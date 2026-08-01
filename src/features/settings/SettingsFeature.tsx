import React from 'react'
import { Power, RefreshCw, Sun, Globe, Bell } from 'lucide-react'
import { useSettingsStore } from '../../store/useSettingsStore'
import { useI18n } from '../../hooks/useI18n'
import { LanguageKey } from '../../i18n/translations'
import { ImportExportFeature } from '../import-export/ImportExportFeature'

export const SettingsFeature: React.FC = () => {
  const {
    autoStartOnBoot,
    setAutoStartOnBoot,
    autoReconnect,
    setAutoReconnect,
    theme,
    setTheme,
    lng,
    setLng,
    notificationsEnabled,
    setNotificationsEnabled
  } = useSettingsStore()

  const { t } = useI18n()

  return (
    <div className="p-4 space-y-4 pb-24 max-w-md mx-auto">
      <h2 className="text-xl font-black text-base-content">{t('settings')}</h2>

      <div className="bg-base-100 border border-base-300 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-base-200 flex items-center justify-center">
              <Power className="w-4 h-4 text-primary" />
            </div>
            <div>
              <span className="font-bold text-sm text-base-content block">
                {t('autoStart')}
              </span>
              <span className="text-xs text-base-content/60 block">
                Launch DNS service on device boot
              </span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={autoStartOnBoot}
            onChange={(e) => setAutoStartOnBoot(e.target.checked)}
            className="toggle toggle-primary toggle-sm"
          />
        </div>

        <div className="divider my-0" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-base-200 flex items-center justify-center">
              <RefreshCw className="w-4 h-4 text-primary" />
            </div>
            <div>
              <span className="font-bold text-sm text-base-content block">
                {t('autoReconnect')}
              </span>
              <span className="text-xs text-base-content/60 block">
                Reconnect automatically if network drops
              </span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={autoReconnect}
            onChange={(e) => setAutoReconnect(e.target.checked)}
            className="toggle toggle-primary toggle-sm"
          />
        </div>

        <div className="divider my-0" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-base-200 flex items-center justify-center">
              <Bell className="w-4 h-4 text-primary" />
            </div>
            <div>
              <span className="font-bold text-sm text-base-content block">
                Persistent Notification
              </span>
              <span className="text-xs text-base-content/60 block">
                Show ongoing notification status
              </span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={(e) => setNotificationsEnabled(e.target.checked)}
            className="toggle toggle-primary toggle-sm"
          />
        </div>
      </div>

      <div className="bg-base-100 border border-base-300 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-base-200 flex items-center justify-center">
              <Sun className="w-4 h-4 text-primary" />
            </div>
            <span className="font-bold text-sm text-base-content">{t('theme')}</span>
          </div>
          <div className="join">
            <button
              onClick={() => setTheme('light')}
              className={`btn btn-xs join-item ${
                theme === 'light' ? 'btn-primary' : 'btn-ghost bg-base-200'
              }`}
            >
              {t('light')}
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`btn btn-xs join-item ${
                theme === 'dark' ? 'btn-primary' : 'btn-ghost bg-base-200'
              }`}
            >
              {t('dark')}
            </button>
          </div>
        </div>

        <div className="divider my-0" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-base-200 flex items-center justify-center">
              <Globe className="w-4 h-4 text-primary" />
            </div>
            <span className="font-bold text-sm text-base-content">{t('language')}</span>
          </div>
          <select
            value={lng}
            onChange={(e) => setLng(e.target.value as LanguageKey)}
            className="select select-sm select-bordered rounded-xl text-xs"
          >
            <option value="eng">English</option>
            <option value="fa">فارسی</option>
            <option value="ru">Русский</option>
          </select>
        </div>
      </div>

      <ImportExportFeature />

      <div className="text-center text-xs text-base-content/40 pt-4">
        <span>DNS Changer Android • {t('version')}</span>
      </div>
    </div>
  )
}
