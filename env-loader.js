
window.remote = require('electron').remote
window.ROOT = remote.getGlobal('ROOT')
window.MODULE_PATH = remote.getGlobal('MODULE_PATH')

require('module').globalPaths.push(window.MODULE_PATH)

require('module').globalPaths.push(window.ROOT)

require('coffee-react/register')
