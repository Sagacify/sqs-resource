import AWS from 'aws-sdk';
import BPromise from 'bluebird';
const log = require('saga-logger').create({ module: 'sqs-resource' });

let sqs;
export const init = (awsConfig = {}, sqsConfig = {}) => {
  AWS.config.update(awsConfig);
  sqs = new AWS.SQS(sqsConfig);
};

export const sendMessage = params => new BPromise((resolve, reject) => {
  log.debug('SQS_SEND_MESSAGE', null, params);

  sqs.sendMessage(params, (err, data) => {
    if (err) {
      log.error('SQS_SEND_MESSAGE_FAIL', err, params);
      return reject(err);
    }

    log.debug('SQS_SEND_MESSAGE_SUCCESS', data, params);
    return resolve(data);
  });
});

export const receiveMessage = params => new BPromise((resolve, reject) => {
  log.debug('SQS_RECEIVE_MESSAGE', null, params);

  sqs.receiveMessage(params, (err, data) => {
    if (err) {
      log.error('SQS_RECEIVE_MESSAGE_FAIL', err, params);
      return reject(err);
    }

    if (!data.Messages || !data.Messages.length) {
      log.debug('SQS_RECEIVE_MESSAGE_EMPTY', data, params);
      return resolve(null);
    }
    log.debug('SQS_RECEIVE_MESSAGE_SUCCESS', data, params);
    return resolve(data.Messages);
  });
});

export const pollMessage = params => new BPromise((resolve, reject) => {
  log.debug('SQS_POLL_MESSAGE', null, params);
  receiveMessage(params)
    .then(messages => {
      log.debug('SQS_POLL_MESSAGE_SUCCESS', messages, params);
      if (messages) {
        resolve(messages);
      } else {
        log.debug('SQS_POLL_MESSAGE_THROTTLE', { throttling: params.throttling || 1000 }, params);
        setTimeout(() => pollMessage(params).then(resolve).catch(reject), params.throttling);
      }
    })
    .catch(err => {
      log.error('SQS_POLL_MESSAGE_FAIL', err, params);
      reject(err);
    });
});

export const deleteMessage = params => new BPromise((resolve, reject) => {
  log.debug('SQS_DELETE_MESSAGE', null, params);

  sqs.deleteMessage(params, (err, data) => {
    if (err) {
      log.error('SQS_DELETE_MESSAGE_FAIL', err, params);
      return reject(err);
    }

    log.debug('SQS_DELETE_MESSAGE_SUCCESS', data, params);
    return resolve();
  });
});
