require "#{ROOT}/views/env"

path = require 'path'

i18n = new (require 'i18n-2')
  locales: ['en-US', 'ja-JP', 'zh-CN', 'zh-TW']
  defaultLocale: 'zh-CN'
  directory: path.join(__dirname, 'i18n')
  extension: '.json'
  devMode: false

i18n.setLocale(window.language)
window.__ = i18n.__.bind(i18n)

try
  require 'poi-plugin-translator'

$('#font-awesome').setAttribute 'href', "#{ROOT}/components/font-awesome/css/font-awesome.min.css"

require './views'
