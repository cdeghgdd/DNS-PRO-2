import { translations } from '../i18n/translations'
import { useSettingsStore } from '../store/useSettingsStore'

export function useI18n() {
  const lng = useSettingsStore((s) => s.lng)
  const currentDict = translations[lng] || translations.eng

  function t(key: keyof typeof translations.eng, params?: Record<string, string>): string {
    let text: string = currentDict[key] || translations.eng[key] || key
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        text = text.replace(`{${k}}`, v)
      }
    }
    return text
  }

  return { t, lng }
}
