// MODIFIED: This is a local copy of gun/src/localStorage.js with Node.js file system modifications
// Original: https://github.com/amark/gun/blob/master/src/localStorage.js
;(function(){

// MODIFIED: Use global Gun (should be available from gun.js loading)
// Original: Uses only global Gun check: if(typeof Gun === 'undefined'){ return }
// Wait for Gun to be available or use global if already set
var Gun = (typeof global !== 'undefined' && global.Gun) || 
          (typeof window !== 'undefined' && window.Gun);

if(typeof Gun === 'undefined'){ 
  // If Gun isn't available yet, delay initialization
  setTimeout(function() {
    Gun = (typeof global !== 'undefined' && global.Gun) || 
          (typeof window !== 'undefined' && window.Gun);
    if (Gun) {
      initializeLocalStorage();
    }
  }, 0);
  return;
}

function initializeLocalStorage() {

// MODIFIED: Added Node.js fs and path modules for file-based storage
// Original: Only uses browser localStorage
var fs = require('fs');
var path = require('path');

var noop = function(){}, store, u;

// MODIFIED: Replaced browser localStorage detection with file-based storage implementation
// Original: try{store = (Gun.window||noop).localStorage}catch(e){}
try{
  // Create file-based localStorage implementation for Node.js
  var dataDir, dataFile;
  
  // Initialize storage in Gun.on('create') to access opt.file
  store = null; // Will be set up in create handler
}catch(e){}

// MODIFIED: Enhanced fallback store for development
// Original: Simple in-memory fallback store
if(!store){
	Gun.log("Warning: File-based localStorage will be initialized on Gun create!");
	store = {setItem: function(k,v){this[k]=v}, removeItem: function(k){delete this[k]}, getItem: function(k){return this[k]}};
}

var parse = JSON.parseAsync || function(t,cb,r){ var u; try{ cb(u, JSON.parse(t,r)) }catch(e){ cb(e) } }
var json = JSON.stringifyAsync || function(v,cb,r,s){ var u; try{ cb(u, JSON.stringify(v,r,s)) }catch(e){ cb(e) } }

Gun.on('create', function lg(root){
	this.to.next(root);
	var opt = root.opt, graph = root.graph, acks = [], disk, to, size, stop;
	if(false === opt.localStorage){ return }
	
	// MODIFIED: Set up file-based storage directory and paths
	// Original: Uses opt.prefix directly for localStorage key
	opt.prefix = opt.file || 'gun/';
	dataDir = path.resolve(opt.prefix);
	dataFile = path.join(dataDir, 'localStorage.json');
	
	// MODIFIED: Create directory if it doesn't exist
	// Original: No directory creation needed for browser localStorage
	try {
		if (!fs.existsSync(dataDir)) {
			fs.mkdirSync(dataDir, { recursive: true });
		}
	} catch(e) {
		Gun.log("Error creating localStorage directory:", e);
	}
	
	// MODIFIED: Create file-based storage interface that mimics browser localStorage
	// Original: Uses browser's localStorage directly
	store = {
		getItem: function(key) {
			try {
				if (fs.existsSync(dataFile)) {
					var data = fs.readFileSync(dataFile, 'utf8');
					var parsed = JSON.parse(data);
					return parsed[key];
				}
			} catch(e) {
				Gun.log("Error reading localStorage file:", e);
			}
			return null;
		},
		setItem: function(key, value) {
			try {
				var data = {};
				if (fs.existsSync(dataFile)) {
					try {
						data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
					} catch(e) {
						// File exists but is corrupted, start fresh
						data = {};
					}
				}
				data[key] = value;
				fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
			} catch(e) {
				Gun.log("Error writing localStorage file:", e);
				throw e;
			}
		},
		removeItem: function(key) {
			try {
				if (fs.existsSync(dataFile)) {
					var data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
					delete data[key];
					fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
				}
			} catch(e) {
				Gun.log("Error removing from localStorage file:", e);
			}
		}
	};

	try{ disk = lg[opt.prefix] = lg[opt.prefix] || JSON.parse(size = store.getItem(opt.prefix)) || {}; // TODO: Perf! This will block, should we care, since limited to 5MB anyways?
	}catch(e){ disk = lg[opt.prefix] = {}; }
	size = (size||'').length;

	// MODIFIED: Added logging for file-based storage initialization
	// Original: No specific logging for localStorage initialization
	Gun.log("localStorage initialized with file:", dataFile);

	root.on('get', function(msg){
		this.to.next(msg);
		var lex = msg.get, soul, data, tmp, u;
		if(!lex || !(soul = lex['#'])){ return }
		data = disk[soul] || u;
		if(data && (tmp = lex['.']) && !Object.plain(tmp)){ // pluck!
			data = Gun.state.ify({}, tmp, Gun.state.is(data, tmp), data[tmp], soul);
		}
		//if(data){ (tmp = {})[soul] = data } // back into a graph.
		//setTimeout(function(){
		Gun.on.get.ack(msg, data); //root.on('in', {'@': msg['#'], put: tmp, lS:1});// || root.$});
		//}, Math.random() * 10); // FOR TESTING PURPOSES!
	});

	root.on('put', function(msg){
		this.to.next(msg); // remember to call next middleware adapter
		var put = msg.put, soul = put['#'], key = put['.'], id = msg['#'], ok = msg.ok||'', tmp; // pull data off wire envelope
		disk[soul] = Gun.state.ify(disk[soul], key, put['>'], put[':'], soul); // merge into disk object
		
		// MODIFIED: Increased storage limit from 5MB to 50MB for file-based storage
		// Original: if(stop && size > (4999880)){ root.on('in', {'@': id, err: "localStorage max!"}); return; }
		if(stop && size > (50000000)){ root.on('in', {'@': id, err: "localStorage file max!"}); return; }
		
		//if(!msg['@']){ acks.push(id) } // then ack any non-ack write. // TODO: use batch id.
		if(!msg['@'] && (!msg._.via || Math.random() < (ok['@'] / ok['/']))){ acks.push(id) } // then ack any non-ack write. // TODO: use batch id.
		if(to){ return }
		
		// MODIFIED: Faster flush timing for development (size/1000 vs size/333)
		// Original: to = setTimeout(flush, 9+(size / 333)); // 0.1MB = 0.3s, 5MB = 15s
		to = setTimeout(flush, 9+(size / 1000)); // Faster flush for development
	});
	function flush(){
		if(!acks.length && ((setTimeout.turn||'').s||'').length){ setTimeout(flush,99); return; } // defer if "busy" && no saves.
		var err, ack = acks; clearTimeout(to); to = false; acks = [];
		json(disk, function(err, tmp){
			try{!err && store.setItem(opt.prefix, tmp);
			}catch(e){ err = stop = e || "localStorage failure" }
			if(err){
				// MODIFIED: Enhanced error logging for file-based storage
				// Original: Gun.log(err + " Consider using GUN's IndexedDB plugin for RAD for more storage space, https://gun.eco/docs/RAD#install");
				Gun.log("localStorage error:", err);
				root.on('localStorage:error', {err: err, get: opt.prefix, put: disk});
			}
			size = tmp.length;

			//if(!err && !Object.empty(opt.peers)){ return } // only ack if there are no peers. // Switch this to probabilistic mode
			
			// MODIFIED: Replaced setTimeout.each with forEach + setTimeout pattern
			// Original: setTimeout.each(ack, function(id){ root.on('in', {'@': id, err: err, ok: 0}); },0,99);
			// MODIFIED: Higher ok code for successful writes (1 vs 0) for better reliability indication
			ack.forEach(function(id, index){
				setTimeout(function(){
					root.on('in', {'@': id, err: err, ok: err ? 0 : 1}); // Higher ok code for successful writes
				}, index * 10); // Small delay between each ack
			});
		})
	}

});
	
} // End of initializeLocalStorage function

// Initialize immediately if Gun is available, otherwise it will be called later
if (Gun) {
  initializeLocalStorage();
}

}());
