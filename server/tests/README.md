# Gun.js Test Suite

This directory contains comprehensive tests for Gun.js functionality, including setup validation, server functionality, and storage systems.

## Available Tests

### 1. Gun Setup Test (`test_gun_setup.js`)
Validates that Gun.js loads correctly and basic functionality works, including localStorage persistence.

### 2. Shims Test (`test_shims.js`) 
Validates that Gun.js shims (utility functions) load and work correctly.

### 3. Gun Server Setup Test (`test_gun_server_setup.js`)
Validates that Gun.js server module loads correctly with all server-specific functionality including networking, super-peer mode, and server persistence.

### 4. ServerStorage Test (`test_serverStorage.js`)
Validates that the serverStorage module works correctly with individual JSON file storage, proper indexing, and data integrity.

## What the Setup Test Covers

1. **Core Module Loading**: Verifies Gun.js loads without errors and has expected version
2. **Constructor Validation**: Checks that Gun has all required methods and properties
3. **Instance Creation**: Tests creating a Gun instance with localStorage configuration
4. **Data Operations**: Validates PUT and GET operations work correctly
5. **localStorage Persistence**: Confirms data is actually written to localStorage files
6. **Event System**: Tests that Gun's reactive event system functions properly

## What the Server Setup Test Covers

1. **Server Module Loading**: Verifies Gun.js server module loads with all dependencies
2. **Server-Specific Properties**: Checks for serve method, SEA module, Mesh networking
3. **Server Instance Creation**: Tests creating Gun instance with server-specific options (super-peer, faith mode)
4. **Server Data Operations**: Validates server PUT/GET operations with persistence
5. **Server Persistence**: Confirms server data is written to disk correctly
6. **Server Event System**: Tests server-specific event handling
7. **Server Networking**: Validates mesh networking and peer capabilities

## What the Shims Test Covers

1. **String Utilities**: Tests `String.random`, `String.match`, and `String.hash`
2. **Object Utilities**: Tests `Object.plain`, `Object.empty`, and `Object.keys`
3. **setTimeout Enhancements**: Tests `setTimeout.hold`, `setTimeout.poll`, `setTimeout.turn`, and `setTimeout.each`
4. **Performance Features**: Tests timing utilities like `setTimeout.check.now`
5. **Async Functionality**: Tests asynchronous execution utilities

## What the ServerStorage Test Covers

1. **Module Loading**: Verifies serverStorage module exists and loads correctly
2. **Storage Initialization**: Tests Gun instance creation with serverStorage enabled
3. **Storage Operations**: Validates PUT operations create proper file structure
4. **Directory Structure**: Confirms storage directory and index file creation
5. **Index Management**: Tests that index.json properly tracks all stored nodes
6. **File Creation**: Validates individual JSON files are created for each node
7. **Data Integrity**: Confirms stored data matches original data
8. **Data Retrieval**: Tests GET operations can retrieve stored data
9. **Storage Management**: Tests size calculation and file naming conventions
10. **Edge Cases**: Tests special characters in soul names and large data handling

## Running the Tests

### Individual Tests

Run each test individually from the server directory:

```bash
# Basic Gun setup test
cd server
node tests/test_gun_setup.js

# Server-specific functionality test  
node tests/test_gun_server_setup.js

# ServerStorage functionality test
node tests/test_serverStorage.js

# Shims test
node tests/test_shims.js
```

### All Tests

Run all tests in sequence:

```bash
cd server
for test in tests/test_*.js; do
  echo "Running $test..."
  node "$test"
  echo "---"
done
```

## Test Output

Each test provides:
- ✓ Green checkmarks for passing tests
- ✗ Red X marks for failing tests  
- Detailed error messages for failures
- Summary statistics (passed/failed/duration)
- Exit code 0 for success, 1 for failure

## Test Data

Tests create temporary directories for data:
- `./gun-data-test` - Basic Gun setup test data
- `./gun-data-server-test` - Server setup test data  
- `./gun-data-storage-test` - ServerStorage test data

These directories are automatically cleaned up after tests complete.

## Troubleshooting

If tests fail:

1. **Module Loading Errors**: Check that Gun.js modules are properly installed and paths are correct
2. **Timeout Errors**: Tests have built-in timeouts (5-15 seconds) - if consistently timing out, there may be hanging processes
3. **File System Errors**: Ensure the test process has write permissions in the test directory
4. **Port Conflicts**: Server tests may fail if ports are already in use

For debugging, check the detailed error messages in the test output.

## localStorage Validation

The test specifically validates:
- localStorage directory is created at the specified file path
- JSON files are actually written to disk with test data
- Data can be retrieved from localStorage after being stored
- File-based localStorage works in Node.js environment

When localStorage is working correctly, you'll see a file like `./gun-data-test/localStorage.json` containing the stored Gun data in JSON format.

## Exit codes

- **0**: All tests passed
- **1**: One or more tests failed or test runner encountered an error

## Timeout

Tests will timeout after 5 seconds to prevent hanging in CI/CD environments.

## What this test validates

This test ensures:
- Gun.js core modules load properly
- Basic Gun instance creation works
- Core operations (put/get) function correctly  
- Event system is working
- Server modules are properly integrated
- No critical errors in the Gun.js setup

If this test passes, it means Gun.js is properly configured and ready for use in the application.
