/**
 * Gun.js Setup Validation Test
 * 
 * This test validates that Gun.js loads correctly and basic functionality works.
 * It tests core Gun operations without requiring a full server setup.
 */

const path = require('path');
const fs = require('fs');

// Test configuration
const TEST_DATA_DIR = './gun-data-test';
const TEST_TIMEOUT = 5000; // 5 seconds

console.log('=== Gun.js Setup Validation Test ===\n');

// Clean up any existing test data
function cleanupTestData() {
  if (fs.existsSync(TEST_DATA_DIR)) {
    try {
      fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true });
      console.log('✓ Cleaned up previous test data');
    } catch (err) {
      console.warn('Warning: Could not clean up test data:', err.message);
    }
  }
}

// Test Gun.js loading and basic functionality
async function runGunTests() {
  let testsPassed = 0;
  let testsFailed = 0;
  
  function testResult(testName, success, details = '') {
    if (success) {
      console.log(`✓ ${testName}${details ? ' - ' + details : ''}`);
      testsPassed++;
    } else {
      console.log(`✗ ${testName}${details ? ' - ' + details : ''}`);
      testsFailed++;
    }
  }
  
  try {
    // Test 1: Load Gun.js core
    console.log('1. Testing Gun.js core loading...');
    let Gun;
    try {
      Gun = require('../gun/gun.js');
      testResult('Gun.js core module loads', true, `version: ${Gun.version || 'unknown'}`);
    } catch (err) {
      testResult('Gun.js core module loads', false, err.message);
      return { testsPassed, testsFailed };
    }
    
    // Test 2: Check Gun constructor
    console.log('\n2. Testing Gun constructor...');
    testResult('Gun is a function', typeof Gun === 'function');
    testResult('Gun has version property', Gun.version !== undefined, Gun.version);
    testResult('Gun has chain methods', Gun.chain !== undefined);
    testResult('Gun has state methods', Gun.state !== undefined);
    testResult('Gun has on method', typeof Gun.on === 'function');
    
    // Test 3: Create Gun instance
    console.log('\n3. Testing Gun instance creation...');
    let gun;
    try {
      gun = Gun({
        file: TEST_DATA_DIR,
        localStorage: true,
        radisk: false, // Disable radisk for simple test
        serverStorage: false,
        multicast: false,
        axe: false,
        peers: []
      });
      testResult('Gun instance created', gun !== undefined);
      testResult('Gun instance has get method', typeof gun.get === 'function');
      testResult('Gun instance has put method', typeof gun.put === 'function');
      testResult('Gun instance has on method', typeof gun.on === 'function');
    } catch (err) {
      testResult('Gun instance created', false, err.message);
      return { testsPassed, testsFailed };
    }
    
    // Test 4: Basic data operations and localStorage persistence
    console.log('\n4. Testing basic data operations and localStorage...');
    return new Promise((resolve) => {
      let operationComplete = false;
      
      try {
        const testData = { name: 'Test User', timestamp: Date.now() };
        gun.get('test').put(testData);
        testResult('PUT operation (sync)', true, 'data stored');
        
        // Test GET operation
        let dataReceived = false;
        gun.get('test').once(function(data, key) {
          if (!dataReceived) {
            dataReceived = true;
            testResult('GET operation retrieves data', data !== undefined && data !== null);
            testResult('Retrieved data has expected properties', data && data.name === 'Test User');
            
            // Test 5: Check localStorage file persistence
            console.log('\n5. Testing localStorage file persistence...');
            setTimeout(() => {
              if (fs.existsSync(TEST_DATA_DIR)) {
                testResult('localStorage directory created', true, TEST_DATA_DIR);
                
                try {
                  const files = fs.readdirSync(TEST_DATA_DIR, { recursive: true });
                  testResult('localStorage files created', files.length > 0, `${files.length} files`);
                  
                  // Check if any files contain our test data
                  let dataFound = false;
                  files.forEach(file => {
                    try {
                      const filePath = path.join(TEST_DATA_DIR, file);
                      const content = fs.readFileSync(filePath, 'utf8');
                      if (content.includes('Test User') || content.includes(testData.timestamp.toString())) {
                        dataFound = true;
                      }
                    } catch (e) {
                      // File might be binary or locked
                    }
                  });
                  testResult('Test data persisted to localStorage', dataFound, 'found in files');
                  
                } catch (e) {
                  testResult('localStorage files created', false, e.message);
                }
              } else {
                testResult('localStorage directory created', false, 'directory not found');
              }
              
              // Test 6: Event system
              testEventSystem();
            }, 200);
          }
        });
        
        function testEventSystem() {
          console.log('\n6. Testing event system...');
          let eventReceived = false;
          const eventData = { event: 'test', time: Date.now() };
          
          // Set up event listener
          gun.get('test-event').on(function(data, key) {
            if (data && data.event === 'test' && !eventReceived) {
              eventReceived = true;
              testResult('Event system works', true, 'event callback fired');
              finishTests();
            }
          });
          
          // Trigger event
          setTimeout(() => {
            gun.get('test-event').put(eventData);
          }, 100);
          
          // Fallback timeout
          setTimeout(() => {
            if (!eventReceived && !operationComplete) {
              testResult('Event system works', false, 'event callback timeout');
              finishTests();
            }
          }, 500);
        }
        
        // Fallback timeout for GET operation
        setTimeout(() => {
          if (!dataReceived && !operationComplete) {
            testResult('GET operation retrieves data', false, 'timeout');
            testResult('Retrieved data has expected properties', false, 'no data received');
            testResult('localStorage directory created', false, 'GET timeout');
            testResult('localStorage files created', false, 'GET timeout');
            testResult('Test data persisted to localStorage', false, 'GET timeout');
            testEventSystem();
          }
        }, 300);
        
      } catch (err) {
        testResult('PUT operation (sync)', false, err.message);
        finishTests();
      }
      
      function finishTests() {
        if (!operationComplete) {
          operationComplete = true;
          resolve({ testsPassed, testsFailed });
        }
      }
    });
    
  } catch (err) {
    console.error('\nUnexpected error during testing:', err);
    testResult('Test execution', false, err.message);
    return { testsPassed, testsFailed };
  }
}

// Main test runner
async function main() {
  const startTime = Date.now();
  
  try {
    // Setup
    cleanupTestData();
    
    // Run tests
    const coreResults = await runGunTests();
    
    // Calculate totals
    const totalPassed = coreResults.testsPassed;
    const totalFailed = coreResults.testsFailed;
    const totalTests = totalPassed + totalFailed;
    
    // Results summary
    const duration = Date.now() - startTime;
    console.log('\n=== Test Results ===');
    console.log(`Tests run: ${totalTests}`);
    console.log(`Passed: ${totalPassed}`);
    console.log(`Failed: ${totalFailed}`);
    console.log(`Duration: ${duration}ms`);
    
    if (totalFailed === 0) {
      console.log('\n🎉 All tests passed! Gun.js is properly set up and working.');
      process.exit(0);
    } else {
      console.log(`\n❌ ${totalFailed} test(s) failed. Please check Gun.js setup.`);
      process.exit(1);
    }
    
  } catch (err) {
    console.error('\n💥 Test runner failed:', err);
    process.exit(1);
  } finally {
    // Cleanup
    cleanupTestData();
  }
}

// Handle timeout
setTimeout(() => {
  console.error('\n⏰ Tests timed out after 5 seconds');
  cleanupTestData();
  process.exit(1);
}, TEST_TIMEOUT);

// Handle process signals
process.on('SIGINT', () => {
  console.log('\n\n🛑 Tests interrupted');
  cleanupTestData();
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Tests terminated');
  cleanupTestData();
  process.exit(1);
});

// Run tests if this file is executed directly
if (require.main === module) {
  main().catch(err => {
    console.error('\n💥 Test execution failed:', err);
    cleanupTestData();
    process.exit(1);
  });
}

module.exports = { runGunTests, main };
