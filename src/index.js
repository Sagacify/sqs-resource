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
    resolve(data);
  });
});

export const receiveMessage = (params, pollThrottling = null) => {
  const meta = Object.assign({}, params, { pollThrottling });

  return new BPromise((resolve, reject) => {
    log.debug('SQS_RECEIVE_MESSAGE', null, meta);
    sqs.receiveMessage(params, (err, data) => {
      if (err) {
        log.error('SQS_RECEIVE_MESSAGE_FAIL', err, meta);
        return reject(err);
      }

      if (!data.Messages || !data.Messages.length) {
        log.debug('SQS_RECEIVE_MESSAGE_EMPTY', data, meta);
        if (pollThrottling === null) {
          resolve(null);
        } else {
          setTimeout(() => {
            receiveMessage(params, pollThrottling).then(resolve).catch(reject);
          }, pollThrottling);
        }
      } else {
        log.debug('SQS_RECEIVE_MESSAGE_SUCCESS', data, meta);
        resolve(data.Messages);
      }
    });
  });
};

export const deleteMessage = params => new BPromise((resolve, reject) => {
  log.debug('SQS_DELETE_MESSAGE', null, params);
  sqs.deleteMessage(params, (err, data) => {
    if (err) {
      log.error('SQS_DELETE_MESSAGE_FAIL', err, params);
      return reject(err);
    }

    log.debug('SQS_DELETE_MESSAGE_SUCCESS', data, params);
    resolve();
  });
});
