/**
 * Gun.js server entrypoint
 * This loads Gun.js core modules explicitly instead of using index.js
 * and the essential modules in the correct order.
 */

// Load Gun.js core modules explicitly in the correct order
const Gun = require('./src/root');    // Core Gun constructor and base functionality

// Make Gun global immediately for modules that need it
// Used in localStorage module.
global.Gun = Gun;

// Already loaded in root, still needed??
// const shim = require('../../gun/src/shim');
// const onto = require('../../gun/src/onto');
// const valid = require('../../gun/src/valid');
// const state = require('../../gun/src/state');
// const dup = require('../../gun/src/dup');
// const ask = require('../../gun/src/ask');

const book = require('../../gun/src/book');

// Core data operations
const chain = require('./src/core/chain');              // Chain method system
const back = require('./src/core/back');
const put = require('./src/core/put');  
const get = require('./src/core/get');

// Events
const on = require('./src/on');

// Map & Set
const map = require('./src/map');
const set = require('./src/set');

// Networking
Gun.Mesh = require('./src/networking/mesh');
const setupWebSockets = require('./src/networking/websocket');
// Gun.on('opt', setupWebSockets);

// LocalStorage
const localStorage = require('./src/localStorage');             // Local storage adapter for development

module.exports = Gun;
