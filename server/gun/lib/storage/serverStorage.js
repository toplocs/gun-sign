/**
 * Server-optimized localStorage alternative for Gun.js
 * Stores each Gun graph node as a separate JSON object for better performance and readability
 * Located in gun/lib/storage/ to distinguish from browser localStorage
 */

;(function(){

// Use global Gun (should be available from gun.js loading)
if(typeof Gun === 'undefined'){ 
  return;
}

// Node.js modules for file system operations
var fs = require('fs');
var path = require('path');

Gun.on('create', function lg(root){
    console.log('Server Storage: create event triggered');
    this.to.next(root);
    var opt = root.opt, graph = root.graph, acks = [], disk, to, size, stop;
    
    // Check if server localStorage is enabled (use different option name to avoid conflicts)
    if(false === opt.serverStorage){ return }
    
    // Set up directory structure for server storage
    opt.prefix = opt.file || 'gun/';
    var dataDir = path.resolve(opt.prefix);
    var storageDir = path.join(dataDir, 'storage');
    var indexFile = path.join(storageDir, 'index.json');
    
    // Ensure storage directory exists
    try {
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        if (!fs.existsSync(storageDir)) {
            fs.mkdirSync(storageDir, { recursive: true });
        }
    } catch(e) {
        Gun.log("Error creating server storage directory:", e);
        return;
    }
    
    // Initialize storage index (tracks all graph nodes)
    var index = {};
    try {
        if (fs.existsSync(indexFile)) {
            console.log("Reading storage index from:", indexFile);
            index = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
        }
    } catch(e) {
        Gun.log("Error reading storage index, starting fresh:", e);
        index = {};
    }
    
    // Load existing data from individual files
    disk = lg[opt.prefix] = lg[opt.prefix] || {};
    size = 0;
    
    Object.keys(index).forEach(function(soul) {
        try {
            var nodeFile = path.join(storageDir, index[soul].file);
            if (fs.existsSync(nodeFile)) {
                var nodeData = JSON.parse(fs.readFileSync(nodeFile, 'utf8'));
                disk[soul] = nodeData;
                size += index[soul].size || 0;
            }
        } catch(e) {
            Gun.log("Error loading node:", soul, e);
        }
    });
    
    Gun.log("Server storage initialized:", storageDir);
    Gun.log("Loaded", Object.keys(disk).length, "nodes, total size:", size, "bytes");

    root.on('get', function(msg){
        console.log('Server Storage: get event:', msg.get);
        this.to.next(msg);
        var lex = msg.get, soul, data, tmp, u;
        if(!lex || !(soul = lex['#'])){ return }
        data = disk[soul] || u;
        if(data && (tmp = lex['.']) && !Object.plain(tmp)){ // pluck!
            data = Gun.state.ify({}, tmp, Gun.state.is(data, tmp), data[tmp], soul);
        }
        Gun.on.get.ack(msg, data);
    });

    root.on('put', function(msg){
        console.log('Server Storage: put event:', msg.put);
        this.to.next(msg);
        var put = msg.put, soul = put['#'], key = put['.'], id = msg['#'], ok = msg.ok||'', tmp;
        
        // Store the data
        disk[soul] = Gun.state.ify(disk[soul], key, put['>'], put[':'], soul);
        
        // Calculate approximate size
        var nodeSize = JSON.stringify(disk[soul]).length;
        
        // Update index
        if (!index[soul]) {
            index[soul] = {
                file: soul.replace(/[^a-zA-Z0-9]/g, '_') + '.json',
                created: Date.now()
            };
            console.log('Created index entry for soul:', soul, 'file:', index[soul].file);
        }
        index[soul].updated = Date.now();
        index[soul].size = nodeSize;
        
        // Update total size
        size = Object.keys(index).reduce(function(total, s) {
            return total + (index[s].size || 0);
        }, 0);
        
        console.log('Updated soul:', soul, 'size:', nodeSize, 'total size:', size);
        
        // Check storage limits (100MB for server storage)
        if(stop && size > (100000000)){ 
            root.on('in', {'@': id, err: "Server storage max!"}); 
            return; 
        }
        
        if(!msg['@'] && (!msg._ || !msg._.via || Math.random() < (ok['@'] / ok['/']))){ 
            acks.push(id) 
        }
        
        // Always schedule flush for new changes
        if(to){ 
            clearTimeout(to); // Clear existing timeout
        }
        to = setTimeout(flush, 10); // Fast flush for development
    });
    
    function flush(){
        
        if(!acks.length && ((setTimeout.turn||'').s||'').length){ 
            setTimeout(flush, 99); 
            return; 
        }
        var err, ack = acks; 
        clearTimeout(to); 
        to = false; 
        acks = [];
        
        try {
            // Save each modified node to its own file
            Object.keys(disk).forEach(function(soul) {
                // Ensure index entry exists
                if (!index[soul]) {
                    index[soul] = {
                        file: soul.replace(/[^a-zA-Z0-9]/g, '_') + '.json',
                        created: Date.now(),
                        updated: Date.now()
                    };
                }
                
                var nodeFile = path.join(storageDir, index[soul].file);
                var nodeData = JSON.stringify(disk[soul], null, 2);
                fs.writeFileSync(nodeFile, nodeData);
                index[soul].size = nodeData.length;
                index[soul].updated = Date.now();
                
                console.log('Saved node to file:', nodeFile, 'size:', nodeData.length);
            });
            
            // Update the index file
            fs.writeFileSync(indexFile, JSON.stringify(index, null, 2));
            
            // Update total size
            size = Object.keys(index).reduce(function(total, soul) {
                return total + (index[soul].size || 0);
            }, 0);
            
        } catch(e) {
            err = e;
            console.error("Server storage flush error:", err);
            Gun.log("Server storage error:", err);
            root.on('serverStorage:error', {err: err, get: opt.prefix, put: disk});
        }

        // Process acknowledgments
        ack.forEach(function(id, idx){
            setTimeout(function(){
                root.on('in', {'@': id, err: err, ok: err ? 0 : 1});
            }, idx * 5);
        });
    }
});

}());
