# sqs-resource

## init
sqs-resource must first be initiated with the method `init` that takes the aws config as first argument and the sqs config as second argument.

## methods
the `sendMessage`, `receiveMessage` and `deleteMessage` methods aws functions are wrapped with proper logging and promisified, and take the usual aws arguments. An additional `pollThrottling` argument is possible for the `receiveMessage` method to activate polling and specify in ms the time to wait before retrying.
