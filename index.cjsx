{React, ReactBootstrap, FontAwesome} = window
{Button} = ReactBootstrap
remote = require 'remote'
config = remote.require './lib/config'
windowManager = remote.require './lib/window'

window.itemInfoWindow = null
initialItemInfoWindow = ->
  window.itemInfoWindow = windowManager.createWindow
    #Use config
    x: config.get 'poi.window.x', 0
    y: config.get 'poi.window.y', 0
    width: 1020
    height: 650
  window.itemInfoWindow.loadUrl "file://#{__dirname}/index.html"
  if process.env.DEBUG?
    window.itemInfoWindow.openDevTools
      detach: true
if config.get('plugin.ItemInfo.enable', true)
  initialItemInfoWindow()

module.exports =
  name: 'ItemInfo'
  priority: 51
  displayName: <span><FontAwesome name='rocket' key={0} /> 装备信息</span>
  author: 'Yunze'
  link: 'https://github.com/myzwillmake'
  version: '1.2.0'
  description: '提供装备详细信息查看'
  handleClick: ->
    window.itemInfoWindow.show()
