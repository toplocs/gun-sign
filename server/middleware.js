/**
 * GunDB Middleware for message validation
 * 
 * This middleware provides validation for Gun.js messages both 
 * incoming and outgoing to ensure data integrity and security.
 * Updated with validated blocking logic for signature "lala".
 */

// Enhanced blocking function with comprehensive signature detection
function shouldBlockMessage(msg) {
    try {
        if (!msg || !msg.put) {
            return false;
        }

        const data = msg.put;
        
        // Check nested signature in content object
        if (data[':'] && typeof data[':'] === 'object') {
            const content = data[':'];
            if (content.signature === 'lala') {
                console.log('🚫 BLOCKED: Message with nested signature "lala"');
                console.log('   Soul:', data['#']);
                console.log('   Field:', data['.']);
                return true;
            }
        }
        
        // Check direct signature property
        if (data.signature === 'lala') {
            console.log('🚫 BLOCKED: Message with direct signature "lala"');
            console.log('   Soul:', data['#']);
            console.log('   Field:', data['.']);
            return true;
        }
        
        return false;
    } catch (e) {
        console.log('❌ Error in blocking logic:', e.message);
        return false;
    }
}

function validateIncoming(msg) {
    console.log('📨 IN =>', Object.keys(msg), 'soul:', msg?.put?.['#'], 'field:', msg?.put?.['.']);

    // Skip validation for user authentication messages and system messages
    if (msg?.put && (msg.put['~@'] || msg._)) {
        this.to.next(msg);
        return;
    }
    
    // Apply blocking logic
    if (shouldBlockMessage(msg)) {
        console.log('🚫 Middleware BLOCKED message - sending error response');
        
        // Send error response instead of passing the message
        this.to.next({ 
            '@': msg['#'], 
            err: 'Invalid message signature - blocked by middleware',
            blocked: true 
        });
        return;
    }

    console.log('✅ Middleware ALLOWED message');
    this.to.next(msg);
}


function validateOutgoing(msg) {
    console.log('📤 OUT =>', Object.keys(msg), 'soul:', msg?.put?.['#']);
    this.to.next(msg);
}

function logMsg(msg) {
    console.log('📝 MSG =>', msg);
    this.to.next(msg);
}

function setupMiddleware(root) {
    console.log('🔧 Setting up Gun.js middleware...');
    
    // Set up middleware for incoming and outgoing messages
    root.on('in', validateIncoming);
    root.on('out', validateOutgoing);
    
    // Optional: Enable detailed logging for debugging
    // root.on('get', logMsg);
    // root.on('put', logMsg);
    
    console.log('🛡️ Middleware: Gun hooks registered with signature blocking');
    this.to.next(root);
}

module.exports = {
    setupMiddleware,
    shouldBlockMessage, // Export for testing
};
