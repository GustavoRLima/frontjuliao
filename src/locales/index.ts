import { createI18n } from 'vue-i18n'
import ptBR from './pt-BR'
import enUS from './en-US'
import esES from './es-ES'
import deDE from './de-DE'
import frFR from './fr-FR'
import itIT from './it-IT'
import zhCN from './zh-CN'
import arSA from './ar-SA'

const messages = {
  'pt-BR': ptBR,
  'en-US': enUS,
  'es-ES': esES,
  'de-DE': deDE,
  'fr-FR': frFR,
  'it-IT': itIT,
  'zh-CN': zhCN,
  'ar-SA': arSA
}

const i18n = createI18n({
  legacy: false,
  locale: 'pt-BR',
  fallbackLocale: 'en-US',
  messages
})

export default i18n
