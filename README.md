# Paws
A (not so) simple log viewer

There's not much here yet.   Currently this project only displays lines it receives from a UDP port.

## Goals
* Allow selection of sources.
  * Tail file following
  * UDP syslog target
  * MQ streams (Kafka, RabbitMQ, ZMQ, etc.)
* Filters/Normalization.
Setting the log format type as well as parsing out common fields.
* Structured logging support.
Allowing examination of structred log data for easier debugging and troubleshooting.
* Request/Response grouping
Grouping of logs from request to response to more easily see the follow of a single request through a complex system.

## Building
To build & run:

```bash
npm install
npm run build
npm start
```
