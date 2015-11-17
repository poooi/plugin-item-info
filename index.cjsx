{React, ReactBootstrap, FontAwesome} = window
{Button} = ReactBootstrap
remote = require 'remote'
windowManager = remote.require './lib/window'

i18n = require 'i18n'
path = require 'path-extra'
{__} = i18n

i18n.configure
  locales: ['en-US', 'ja-JP', 'zh-CN', 'zh-TW']
  defaultLocale: 'zh-CN'
  directory: path.join(__dirname, 'i18n')
  updateFiles: false
  indent: '\t'
  extension: '.json'
i18n.setLocale(window.language)

window.itemInfoWindow = null
initialItemInfoWindow = ->
  window.itemInfoWindow = windowManager.createWindow
    x: config.get 'poi.window.x', 0
    y: config.get 'poi.window.y', 0
    width: 1020
    height: 650
  window.itemInfoWindow.loadUrl "file://#{__dirname}/index.html"

if config.get('plugin.ItemInfo.enable', true)
  initialItemInfoWindow()

module.exports =
  name: 'ItemInfo'
  priority: 51
  displayName: <span><FontAwesome name='rocket' key={0} />{' ' + __('Equipment Info')}</span>
  author: 'Yunze'
  link: 'https://github.com/myzwillmake'
  version: '1.5.0'
  description: __ 'Show detailed information of all owned equipment'
  handleClick: ->
    if process.env.DEBUG?
      window.itemInfoWindow.openDevTools
        detach: true
    window.itemInfoWindow.show()