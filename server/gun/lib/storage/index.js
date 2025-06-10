// Load YSON parser
require('gun/lib/yson');

// Load server-optimized storage after all core modules are loaded
const serverStorage = require('./serverStorage');   // Server storage with individual JSON files


// Load RFS first to initialize opt.store
const Store = require('./rfs');

function setLocalRFS(root){
    console.log('Local RFS: create event triggered with options:', {
        file: root.opt.file,
        rfs: root.opt.rfs,
        hasStore: !!root.opt.store
    });
    this.to.next(root);
    var opt = root.opt;
    if(opt.rfs === false){ return }
    // Force store initialization for local setup
    opt.store = opt.store || Store(opt);
    console.log('Local RFS storage initialized for file:', opt.file);
}

Gun.on('create', setLocalRFS);

// Load store module after RFS has set up the storage interface
// store loads radisk, radisk loads radix and yson
require('./store');


module.exports = {
  // Re-export storage modules for convenience
  radisk: require('./radisk'),
  radix: require('./radix'),
  rfs: require('./rfs'),
  store: require('./store'),
  yson: require('./yson')
};
