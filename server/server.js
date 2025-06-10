const express = require('express');
const cors = require('cors');
const path = require('path');

// Load Gun with all server modules pre-loaded
const config = require('./config');
const Gun = require('./gun/lib/server');
const { setupMiddleware } = require('./middleware');

// Load App modules
const Runner = require('./runner');
const runner = new Runner();
const Heartbeat = require('./heartbeat');

// Initialize express app
const app = express();
const port = config.port;

// Enable CORS for all requests
app.use(cors());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Handle root route
app.get('/', (req, res) => {
  res.send('GunDB server is running!');
});

Gun.on('opt', setupMiddleware);

// Setup Server with Gun
const server = app.listen(port, () => {
    console.log(`GunDB server running on port ${port}`);
    
    
    // Setup Gun
    const gunOptions = {
    ...config.gunOptions,
    web: server,
    log: Gun.log || console.log,  // Provide a log function for modules that need it
    };

    const gun = Gun(gunOptions);

    gun.on('opt', (root) => {
        this.to.next(root);
    });
    console.log("--------");

    // Start heartbeat
    const heartbeat = new Heartbeat(gun, 1000);
    // runner.start(heartbeat)
});



// Check for test mode - run for 5 seconds then exit
const isTestMode = process.argv.includes('--test') || process.env.NODE_ENV === 'test';
if (isTestMode) {
  console.log('Running in test mode - will exit after 5 seconds');
    setTimeout(runner.shutdown, 3000);
}

// Graceful shutdown - stop heartbeat and clean up
process.on('SIGINT', runner.shutdown);
process.on('SIGTERM', runner.shutdown);
