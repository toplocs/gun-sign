class Runner {
    procs = [];

    constructor(server) {
        this.server = server;
    }

    start(proc) {
        if (proc.start && typeof proc.start === 'function') {
            this.procs.push(proc);
            proc.start();
        }
    }

    stop(proc) {
        const index = this.procs.indexOf(proc);
        if (index !== -1) {
            this.procs.splice(index, 1);
            if (proc.stop && typeof proc.stop === 'function') {
                proc.stop();
            }
        }
    }

    shutdown() {
        console.log('Shutting down server...');
        running.forEach(proc => this.stop(proc));
        server.close(() => {
            console.log('Server closed');
            process.exit(0);
        });
    }
}

module.exports = Runner;
