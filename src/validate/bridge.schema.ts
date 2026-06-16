import { JSONSchema7 } from 'json-schema';
import { v4 } from 'uuid';

export const bridgePayloadSchema: JSONSchema7 = {
  $id: v4(),
  type: 'object',
  properties: {
    urls: { type: 'array', items: { type: 'string' }, minItems: 1 },
    host: { type: 'string' },
  },
  required: ['urls'],
  additionalProperties: false,
};

export const approvePayloadSchema: JSONSchema7 = {
  $id: v4(),
  type: 'object',
  properties: {
    messageId: { type: 'string' },
  },
  required: ['messageId'],
  additionalProperties: false,
};

export const webhookPayloadSchema: JSONSchema7 = {
  $id: v4(),
  type: 'object',
  properties: {
    event: { type: 'string' },
    instance: { type: 'string' },
    data: {}
  },
  required: ['event', 'instance', 'data'],
  additionalProperties: false,
};
