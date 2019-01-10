/* ================================================================================================================= */
/* ================================================================================================================= */

const dgram = require('dgram');

/* ================================================================================================================= */

// This is the example UDP server from the node docs, just exploring how this works.

const logServer = dgram.createSocket('udp4');
logServer.on('error', (err: Error) =>
{
    console.log(`server error:\n${err}`);
});

logServer.on('message', (message: any, rinfo: any) =>
{
    /*
     * rinfo: { address: 'ip', family: 'IPvX', port: remote_port_num, size: num_bytes }
     */
    console.log(rinfo, `: ${message}`);
});

logServer.on('listening', () =>
{
    /*
     * Address: { address: 'ip', family: 'IPvX', port: 41234 };
     */
    const address = logServer.address();
    console.log("server listening", address);
});

logServer.bind(41234);

/* ================================================================================================================= */