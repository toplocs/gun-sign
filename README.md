# Gun-Sign

A Vue.js application with GunDB for decentralized data storage and real-time syncing, including a dedicated GunDB server.

## Project Structure

This project uses pnpm workspaces to organize its components:

- `/client`: Vue.js client application
- `/server`: Express server for Gun
- `/gun`: Gun.js library code (vendored)

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Project Setup

```sh
# Install dependencies for all workspaces
pnpm install
```

## Development

```sh
# Start both client and server in development mode
pnpm dev

# Start all components (client, server, and gun example)
pnpm dev:all
```

## Git Remotes

This repository is set up with multiple git remotes:

- `origin`: The main gun-sign repository
- `gun-remote`: The Gun.js repository, vendored as a subdirectory

## Updating Gun.js

To update the vendored Gun.js code:

```bash
git fetch gun-remote
git subtree pull --prefix=gun gun-remote master --squash
```

```sh
# Clone the Gun.js repository
git clone https://github.com/amark/gun.git server/gun

# Install server dependencies
cd server
npm install
```

## Development

### Start Components Individually

```sh
# Start only the client
pnpm dev

# Start only the server
cd server
npm run dev
```

## Server Configuration

The GunDB server can be configured by editing `/server/config.js`. See the [server README](/server/README.md) for more details.

### Client Development Commands

```sh
# Compile and hot-reload for development
pnpm dev

# Type-check, compile and minify for production
pnpm build

# Run unit tests with Vitest
pnpm test:unit
```

### Server Commands

```sh
# Start the server in production mode
cd server
npm start

# Start the server in development mode with auto-restart
cd server
npm run dev

# Start the server with debugging enabled
cd server
npm run debug
```

## Deployment

### Client Application

```sh
# Build for production
pnpm build

# Serve the built files
pnpm preview
```

### Server Deployment

You can run the GunDB server as a standalone service. See [server README](/server/README.md#running-as-a-service) for more details on setting up as a system service.
# gun-sign
