# Paws
A (not so) simple log viewer

There's not much here yet.   Currently this project only displays lines it receives from a UDP port.

## Goals
- [ ] Allow selection of sources.
  - [ ] Tail file following
  - [X] UDP syslog target
  - [ ] MQ streams (Kafka, RabbitMQ, ZMQ, etc.)
  - [ ] Others (API)
- [ ] Filters/Normalization.
  - [ ] JSON format
  - [ ] Plain text reading (awk style?)
  - [ ] Others (API)
- [ ] Structured logging support.
- [ ] Request/Response grouping

## Building
To build & run:

```bash
npm install
npm run build
npm start
```
