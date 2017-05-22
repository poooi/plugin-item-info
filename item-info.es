import 'views/env'
import { join } from 'path'
import i18n2 from 'i18n-2'
import { remote } from 'electron'
import { debounce } from 'lodash'

const i18n = new i18n2({
  locales: ['ko-KR', 'en-US', 'ja-JP', 'zh-CN', 'zh-TW'],
  defaultLocale: 'zh-CN',
  directory: join(__dirname, 'i18n'),
  extension: '.json',
  devMode: false,
})

i18n.setLocale(window.language)
if (i18n.resources == null) {
  i18n.resources = {}
}
if (i18n.resources.__ == null) {
  i18n.resources.__ = str => str
}
if (i18n.resources.translate == null) {
  i18n.resources.translate = (locale, str) => str
}
if (i18n.resources.setLocale == null) {
  i18n.resources.setLocale = () => {}
}
window.i18n = i18n
try {
  require('poi-plugin-translator').pluginDidLoad()
} catch (e) {
  console.warn(e)
}
window.__ = i18n.__.bind(i18n)
window.__r = i18n.resources.__.bind(i18n.resources)

document.title = window.__('Equipment Info')
window.pluginWindow = remote.getCurrentWindow()
window.pluginContents = remote.getCurrentWebContents()

const rememberSize = debounce(() => {
  const b = window.pluginWindow.getBounds()
  config.set('plugin.ShipInfo.bounds', b)
}, 5000)

// apply zoomLevel to webcontents
const setZoom = (zoom) => {
  window.pluginContents.setZoomFactor(zoom)
}

setZoom(config.get('poi.zoomLevel', 1))

const handleConfig = (path, value) => {
  switch (path) {
    case 'poi.zoomLevel': {
      const zoom = parseFloat(value)
      if (!Number.isNaN(zoom)) {
        setZoom(zoom)
      }
    }
      break
    default:
  }
}

config.on('config.set', handleConfig)

window.addEventListener('unload', () => {
  config.removeListener('config.set', handleConfig)
})

window.pluginWindow.on('move', rememberSize)
window.pluginWindow.on('resize', rememberSize)


require('./views')
