import { createI18n } from 'vue-i18n'
import axios from 'axios'

export const i18n = createI18n({
  legacy: false, // you must set `false`, to use Composition API
  locale: 'en', // set locale
  fallbackLocale: 'en',
  messages: {} // set locale messages
})

export function loadLanguage(lang) {
  axios.get( `/translator/getLocale/${lang}` ).then(response => {
    i18n.global.setLocaleMessage(lang, response.data)
    i18n.global.locale.value = lang
  })
  // if we want to implement lazy loading then refer to https://vue-i18n.intlify.dev/guide/advanced/lazy-loading.html
}
