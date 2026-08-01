import React from 'react'
import { Moon, Sun, Globe, Shield } from 'lucide-react'
import { useSettingsStore } from '../store/useSettingsStore'
import { useI18n } from '../hooks/useI18n'

export const Navbar: React.FC = () => {
  const { theme, setTheme, lng, setLng } = useSettingsStore()
  const { t } = useI18n()

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <header className="navbar bg-base-100 border-b border-base-300 px-4 sticky top-0 z-40">
      <div className="flex-1 flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-primary text-primary-content flex items-center justify-center font-bold text-lg">
          <Shield className="w-5 h-5" />
        </div>
        <span className="font-extrabold text-lg tracking-tight text-base-content">
          {t('title')}
        </span>
      </div>
      <div className="flex-none flex items-center gap-2">
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-circle btn-sm">
            <Globe className="w-4 h-4" />
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box w-32 border border-base-300 z-50 mt-2"
          >
            <li>
              <button
                onClick={() => setLng('eng')}
                className={lng === 'eng' ? 'active font-bold' : ''}
              >
                English
              </button>
            </li>
            <li>
              <button
                onClick={() => setLng('fa')}
                className={lng === 'fa' ? 'active font-bold' : ''}
              >
                فارسی
              </button>
            </li>
            <li>
              <button
                onClick={() => setLng('ru')}
                className={lng === 'ru' ? 'active font-bold' : ''}
              >
                Русский
              </button>
            </li>
          </ul>
        </div>

        <button onClick={toggleTheme} className="btn btn-ghost btn-circle btn-sm">
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  )
}
