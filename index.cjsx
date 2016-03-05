module.exports =
  windowOptions:
    x: config.get 'poi.window.x', 0
    y: config.get 'poi.window.y', 0
    width: 1020
    height: 650
    title: i18n.ItemInfo.__('Equipment Info')
    indexName: 'ItemInfo'
  windowURL: "file://#{__dirname}/index.html"
  useEnv: true
