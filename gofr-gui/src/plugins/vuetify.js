import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#3F51B5',
          secondary: '#7986CB',
          accent: '#9c27b0',
          error: '#f44336',
          warning: '#ffeb3b',
          info: '#2196f3',
          success: '#4caf50'
        }
      }
    }
  }
})
