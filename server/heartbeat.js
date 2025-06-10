/**
 * Heartbeat module for Gun.js server
 * Provides periodic health status updates to the Gun database
 */

class Heartbeat {
  constructor(gun, interval = 1000) {
    this.gun = gun;
    this.interval = interval;
    this.intervalId = null;
    this.isRunning = false;
  }

  /**
   * Update the heartbeat with current timestamp and status
   */
  updateHeartbeat() {
    const timestamp = new Date().toISOString();
    const data = { time: timestamp, status: 'alive' };
    this.gun.get('heartbeat').put(data);
    console.log('Heartbeat updated:', timestamp);
  }

  /**
   * Start the heartbeat mechanism
   */
  start() {
    if (this.isRunning) {
      console.warn('Heartbeat is already running');
      return;
    }

    console.log(`Starting heartbeat with ${this.interval}ms interval`);
    
    // Update immediately
    this.updateHeartbeat();
    
    // Start periodic updates
    this.intervalId = setInterval(() => {
      this.updateHeartbeat();
    }, this.interval);
    
    this.isRunning = true;
  }

  /**
   * Stop the heartbeat mechanism
   */
  stop() {
    if (!this.isRunning) {
      console.warn('Heartbeat is not running');
      return;
    }

    console.log('Stopping heartbeat');
    clearInterval(this.intervalId);
    this.intervalId = null;
    this.isRunning = false;
  }

  /**
   * Get the current heartbeat status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      interval: this.interval,
      intervalId: this.intervalId
    };
  }
}

module.exports = Heartbeat;
