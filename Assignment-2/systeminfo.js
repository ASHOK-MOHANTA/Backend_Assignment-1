const os = require("os");

function getsysinfo(){
    console.log(".........System Information.............");
    console.log("System Architecture", os.arch());
    console.log("Number of CPU cores:", os.cpus().length);
    console.log("CPU model:", os.cpus()[0].model);
    console.log("CPU speed (MHZ):",os.cpus()[0].speed);
    console.log("Total memory (MB):", (os.totalmem()/(1024*1024)).toFixed(2));
    console.log("Total memory (MB):", (os.freemem()/(1024*1024)).toFixed(2));

    const memoryusage = process.memoryUsage();
    console.log("Heap used (MB)",(memoryusage.heapUsed / (1024*1024)).toFixed(2));
    console.log("Heap Total (MB)",(memoryusage.heapTotal / (1024*1024)).toFixed(2));

    console.log("Hostname:",os.hostname());
    console.log("OS Type:",os.type());
    console.log("OS platform",os.platform())
    console.log("Os Release", os.release())

}

module.exports = getsysinfo