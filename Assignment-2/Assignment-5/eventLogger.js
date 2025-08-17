const EventEmitter = require("events");

class Logger extends EventEmitter {}

const logger = new Logger();

logger.on("log",(msg)=>{
    console.log(`[${new Date().toISOString()}] ${msg}`);
});

module.exports = logger;