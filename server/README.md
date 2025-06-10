# GunDB Server

A minimal GunDB server implementation using the latest version of Gun.js from GitHub.

## Features

- Uses Gun.js directly from GitHub repository
- Express server with CORS support
- Advanced middleware for validating incoming and outgoing messages
- Complete configuration with all available Gun.js options
- User authentication support with SEA.js
- Simple web interface for testing
- Message signing and verification
- Optimized for production use

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/amark/gun.git server/gun
   ```

2. Install dependencies:
   ```bash
   cd server
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

   Or for development with automatic restart:
   ```bash
   npm run dev
   ```

## Usage

The server runs on port 8765 by default. You can access the web interface at http://localhost:8765.

### For client applications

Connect to the GunDB server using:

```javascript
const gun = Gun({
  peers: ['http://localhost:8765/gun']
});
```

## Configuration

Server settings can be modified in the `config.js` file. The configuration includes:

### Core Options

```javascript
{
  file: 'gun-data',        // Local file storage path
  radisk: true,            // Enable file storage engine
  localStorage: false,     // Don't use localStorage in Node.js
  multicast: false,        // Disable multicast DNS discovery
  axe: false,              // Disable Axe P2P discovery
}
```

### Performance Tuning

```javascript
{
  memory: {                // Memory management
    max: 300 * 1000 * 1000, // 300MB memory limit
    force: false,          // Don't force clean memory
    limit: 100000          // Limit for number of nodes to keep in memory
  },
  batch: 10,               // Batch writes
  chunk: 1024 * 100,       // Save chunks to disk at this size
}
```

### Network Configuration

```javascript
{
  peers: [],               // Array of peer URLs to connect to
  web: server,             // Express/HTTP server
}
```

### Message Hooks

```javascript
{
  hooks: {
    in: validateIncoming,  // Validate incoming data
    out: validateOutgoing  // Validate outgoing data
  }
}
```

## Middleware

The server uses middleware functions to validate incoming and outgoing messages. These are defined in `middleware.js`.

The middleware provides:

- Message size validation (enforcing 2MB limit)
- Structure validation
- Content validation for specific data types 
- Security filtering
- Message rate limiting

You can customize these validations for your specific application needs.

## Running as a Service

### Using PM2

Install PM2:
```bash
npm install -g pm2
```

Start the server:
```bash
pm2 start server.js --name "gundb-server"
pm2 save
pm2 startup
```

### Using systemd (Linux)

Create a service file at `/etc/systemd/system/gundb.service`:

```
[Unit]
Description=GunDB Server
After=network.target

[Service]
Type=simple
User=yourusername
WorkingDirectory=/path/to/server
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=gundb

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl enable gundb
sudo systemctl start gundb
```

## Security Considerations

- The server validates message structure but you should customize validation for your use case
- Consider running behind a reverse proxy like Nginx for additional security
- Use SEA.js for secure user authentication
- Consider implementing API keys for trusted clients

## License

This project is MIT licensed.
