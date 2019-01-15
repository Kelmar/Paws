# Paws
A (not so) simple log viewer

There's not much here yet.   Currently this project only displays lines it receives from a UDP port.

## Building
To build & run:

```bash
npm install
npm run build
npm start
```

## Goals
These are the current goals of the project; they are not all complete or started yet.

### Source Selection
Ideally a user can select their desired sources for logs from files or a network resource of some sort.

Some current ideas are:
- [ ] Tail file following
- [X] UDP syslog target
- [ ] MQ streams (Kafka, RabbitMQ, ZMQ, etc.)
- [ ] Others (API/Plug-in)

### Filters & Normalization
Logs come in many different shapes and sizes.  To display it inteligibly and notify the users of critical events the
data needs to be normalized into a standardized format.

Some formats to consider:
- [ ] JSON format
- [ ] Plain text reading (awk style?)
- [ ] Web server logs (e.g. CLS, ELF, etc.)
- [ ] Windows Event Logs
- [ ] Others (API/Plug-in)

### Structured Logging
Handling of structured logs so users can view and filter on additional properties, such as "user name", would help in
finding specific errors and logs when the volume is high.

### Request & Response Detection
Detecting requests and responses and all of the relevant logs so that they can be grouped together showing the flow of
a single request through a complex system.
