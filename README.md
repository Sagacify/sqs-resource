# sqs-resource

## init
sqs-resource must first be initiated with the method `init` that takes the aws config as first argument and the sqs config as second argument.

## methods
the `sendMessage`, `receiveMessage` and `deleteMessage` methods aws functions are wrapped with proper logging and promisified, and take the usual aws arguments. An additional `pollMessage` method is provided to poll sqs until a message is available, it takes usual aws argument for receiving message plus a `throttling` arguments to wait when no message (default 1000ms).
