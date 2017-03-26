module.exports =
  windowOptions:
    x: config.get 'poi.window.x', 0
    y: config.get 'poi.window.y', 0
    width: 1020
    height: 650
  windowURL: "file://#{__dirname}/index.html"
  useEnv: true
