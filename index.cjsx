__ = i18n['poi-plugin-item-info'].__.bind(i18n['poi-plugin-item-info'])
module.exports =
  windowOptions:
    x: config.get 'poi.window.x', 0
    y: config.get 'poi.window.y', 0
    width: 1020
    height: 650
    title: __('Equipment Info')
    indexName: 'ItemInfo'
  windowURL: "file://#{__dirname}/index.html"
