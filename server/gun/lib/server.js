/**
 * Gun Server Module Loader
 * Based on gun/lib/server.js but with explicit static loading
 */

// Start with base Gun
const Gun = require('../gun');

// Add serve functionality from the already created serve.js file
const serve = require('../../../gun/lib/serve');
Gun.serve = serve;

// Set up default options for server mode
function setDefaultOptions(root){
  var u;
  if(u === root.opt.super){ root.opt.super = true }
  if(u === root.opt.faith){ root.opt.faith = true } // HNPERF: This should probably be off, but we're testing performance improvements, please audit.
  root.opt.log = root.opt.log || Gun.log;
  this.to.next(root);
}
Gun.on('opt', setDefaultOptions);


// Storage Setup
require('./storage');

// Load server-optimized storage after all core modules are loaded
// const serverStorage = require('./storage/serverStorage');   // Server storage with individual JSON files


// Networking
require('./routing/wire');

require('../../../gun/sea.js');
// require('../../../gun/lib/axe');

// Load optional modules
// require('../../../gun/lib/multicast');
// require('../../../gun/lib/stats');

module.exports = Gun;
