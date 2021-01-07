const messages = {
  'ja-JP': require('./locales/ja-JP.json')
}

const numberFormats = {
  'ja-JP': {
    currency: {
      style: 'currency',
      currency: 'JPY',
      currencyDisplay: 'symbol'
    }
  }
}

export default {
  locale: 'ja-JP',
  fallbackLocale: 'ja-JP',
  messages,
  numberFormats,
  silentTranslationWarn: true
}
