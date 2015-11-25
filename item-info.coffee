require "#{ROOT}/views/env"

i18n = require 'i18n'
path = require 'path-extra'

i18n.configure
  locales: ['en-US', 'ja-JP', 'zh-CN', 'zh-TW']
  defaultLocale: 'zh-CN'
  directory: path.join(__dirname, 'i18n')
  updateFiles: false
  indent: '\t'
  extension: '.json'

window.language = config.get 'poi.language', navigator.language
i18n.setLocale(window.language)
window.__ = i18n.__

window.theme = config.get 'poi.theme', '__default__'
if theme == '__default__'
  $('#bootstrap-css')?.setAttribute 'href', "file://#{ROOT}/components/bootstrap/dist/css/bootstrap.css"
else
  $('#bootstrap-css')?.setAttribute 'href', "file://#{ROOT}/assets/themes/#{theme}/css/#{theme}.css"
window.addEventListener 'theme.change', (e) ->
  window.theme = e.detail.theme
  if theme == '__default__'
    $('#bootstrap-css')?.setAttribute 'href', "file://#{ROOT}/components/bootstrap/dist/css/bootstrap.css"
  else
    $('#bootstrap-css')?.setAttribute 'href', "file://#{ROOT}/assets/themes/#{theme}/css/#{theme}.css"

require './views'
