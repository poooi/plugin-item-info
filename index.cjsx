
path = require 'path'

i18n = new (require 'i18n-2')
  locales: ['en-US', 'ja-JP', 'zh-CN', 'zh-TW']
  defaultLocale: 'zh-CN'
  directory: path.join(__dirname, 'i18n')
  extension: '.json'
  devMode: false

i18n.setLocale(window.language)
__ = i18n.__.bind(i18n)

window.itemInfoWindow = null

if config.get 'plugin.ItemInfo.enable', true
  {remote} = require 'electron'
  windowManager = remote.require './lib/window'
  window.itemInfoWindow = windowManager.createWindow
    x: config.get 'poi.window.x', 0
    y: config.get 'poi.window.y', 0
    width: 1020
    height: 650
    title: __('Equipment Info')
    indexName: 'ItemInfo'
  window.itemInfoWindow.loadURL "file://#{__dirname}/index.html"

module.exports =
  name: 'ItemInfo'
  priority: 51
  displayName: <span><FontAwesome name='rocket' key={0} />{' ' + __('Equipment Info')}</span>
  author: 'taroxd'
  link: 'https://github.com/taroxd'
  version: '1.8.0'
  description: __ 'Show detailed information of all owned equipment'
  handleClick: ->
    window.itemInfoWindow.show()
