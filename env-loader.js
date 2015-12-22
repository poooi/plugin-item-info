window.remote = require('remote');

window.ROOT = remote.getGlobal('ROOT');

window.MODULE_PATH = remote.getGlobal('MODULE_PATH');

require('module').globalPaths.push(MODULE_PATH);

require('coffee-react/register');
