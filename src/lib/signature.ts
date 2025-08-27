import * as crypto from 'crypto';

// Helper function to convert DER Base64 to PEM format
function derBase64ToPem(derBase64: string, label = 'RSA PRIVATE KEY'): string {
  const derBuffer = Buffer.from(derBase64, 'base64');
  const base64Lines = derBuffer
    .toString('base64')
    .match(/.{1,64}/g) || [];
  return `-----BEGIN ${label}-----\n${base64Lines.join('\n')}\n-----END ${label}-----\n`;
}

// Generate signature for access token
export function generateAccessTokenSignature(
  timestamp: string,
  clientKey: string,
  privateKey: string,
  httpMethod: string,
  path: string
): string {
  const data = `${httpMethod}:${path}:${timestamp}:${clientKey}`;
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(data);
  sign.end();
  const pemKey = derBase64ToPem(privateKey);
  return sign.sign(pemKey, 'base64');
}

// Generate signature for transfer inquiry
export function generateTransferInquirySignature(
  clientKey: string,
  timestamp: string,
  body: any,
  httpMethod: string,
  path: string,
  privateKey: string
): string {
  const stringBody = typeof body === 'string' ? body : JSON.stringify(body);
  const data = `${httpMethod}:${path}:${stringBody}:${timestamp}:${clientKey}`;
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(data);
  sign.end();
  const pemKey = derBase64ToPem(privateKey);
  return sign.sign(pemKey, 'base64');
}

// Generate signature for transfer out
export function generateTransferOutSignature(
  clientKey: string,
  timestamp: string,
  body: any,
  httpMethod: string,
  path: string,
  privateKey: string
): string {
  // ${httpMethod}:${path}:${timestamp}:${clientKey}
  const stringBody = typeof body === 'string' ? body : JSON.stringify(body);
  const data = `${httpMethod}:${path}:${stringBody}:${timestamp}:${clientKey}`;
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(data);
  sign.end();
  const pemKey = derBase64ToPem(privateKey);
  return sign.sign(pemKey, 'base64');
}

// Generate current timestamp in ISO format
export function generateTimestamp(): string {
  return new Date().toISOString();
}

// Generate unique reference number
export function generateReferenceNo(): string {
  return `PAT-${crypto.randomUUID()}`;
}
