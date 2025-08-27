import * as crypto from 'crypto';

// Helper function to convert DER Base64 to PEM format
function derBase64ToPem(derBase64, label = 'RSA PRIVATE KEY') {
  const derBuffer = Buffer.from(derBase64, 'base64');
  const base64String = derBuffer.toString('base64');
  const base64Lines = base64String.match(/.{1,64}/g) || [];
  return `-----BEGIN ${label}-----\n${base64Lines.join('\n')}\n-----END ${label}-----\n`;
}

// Generate signature for transfer-out request
function generateTransferSignature({ clientKey, timestamp, body, httpMethod, path, privateKey }) {
  const stringBody = typeof body === 'string' ? body : JSON.stringify(body);
  const data = `${httpMethod}:${path}:${stringBody}:${timestamp}:${clientKey}`;
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(data);
  sign.end();
  const pemKey = derBase64ToPem(privateKey);
  return sign.sign(pemKey, 'base64');
}

// Verify signature (simulating what the server does)
function verifySignatureTransaction({ clientKey, signature, timestamp, body, httpMethod, path, publicKey }) {
  // const { clientKey, signature, timestamp, body, httpMethod, path, publicKey } = params;

  const stringBody = typeof body === 'string' ? body : JSON.stringify(body);
  const data = `${httpMethod}:${path}:${stringBody}:${timestamp}:${clientKey}`;

  // 1. Validate timestamp format (strict ISO 8601)
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(timestamp)) {
    return false;
  }

  const now = Date.now();
  const ts = Date.parse(timestamp);
  if (isNaN(ts)) return false;

  // 2. Reject if timestamp does not valid
  const THIRTY_MINUTES_MS = 30 * 60 * 1000;
  if (Math.abs(now - ts) > THIRTY_MINUTES_MS) return false;

  // 3. Verify signature
  try {
    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(data);
    verify.end();

    // Handle both DER (Base64) and PEM formats
    let keyObj;
    if (publicKey.includes('BEGIN PUBLIC KEY')) {
      keyObj = publicKey; // PEM
    } else {
      const publicKeyBuffer = Buffer.from(publicKey, 'base64'); // DER
      keyObj = { key: publicKeyBuffer, format: 'der', type: 'spki' };
    }

    return verify.verify(keyObj, signature, 'base64');
  } catch (err) {
    this.logger.warn('ERR vefirying signature ', { error: err.message });
    return false;
  }
}

// Example usage for transfer-out endpoint
console.log('🧪 Testing Transfer-Out Signature Verification\n');

const privateKey = `MIIEogIBAAKCAQEAmmC5cXh7zjQTKroOT885tZO3kc023MPKGNdJhjvV9OTRQ1y/MRTTRl/9YGlaYXrr1ud+jtkAuFGLJR+FbAX29JdbWkSyt0TL1QPrQF3zsZ9ihv03xUcdcRSQwlcogrBWcMmvmfbX2+ck5GbfAl8Pz9s1Cx7slQIk03xkA7YeDd5AKRTZiQhTLFJ4YI/q0XhZ+vYKHOwW/7z8KiswlBV1MTtkRuEpd+8x353HT6TVsi7VBO8d9OdxHfuTXK0Tw30WqJO9+ydAoWOYwE3WigS6/uc9xYXUccYpqbD79DDbAM/UVm76vdL8uYYQ6Ef7CZu+W++j+OEUMgU8BB169cmEzwIDAQABAoIBACjm/7tExOi5e2qSqUAUE6I8ZSLIUITliyJRyDU8nU+pYJiMdku2zNOUkzl8MGore1kRNML8U+iCEm/fjiY03l2nzJh6Iy/Tln3179q6CdtB84T4ilJGqVJQtJoJJb6aogx4I4KTmFW3RFsPtn6WWUYlOkScCOriCofOKWGiWwwpMVZtwBURKETct/7uCDiL48FM0vMmzHcubdVtAtdj8d8PX0s0Rf6Q2u2+ByEX/m6ZpVsp9SAwTS3Kr4Hzcu+bquCZ36Poonoi60RXxbSpBSenWhoXLFM24Hl+s+wk1RrrkGJyGbe2Cz8BbW50HwuSfwwt4s+IVQSDWpH3yv8fLyECgYEAxylKb8WP6mIgMactLU9M6kLtngsk5fE8QlxoCXVHravC01QpGROiBGxAbbyef+f0UstfNf2haV3Mv9Cd90MKjtoGCVwoXN6xLcDQV53AryO8/zYVMf/U+Kt2yLC+pIUGuL+ztQV14hBDznMy7m+tQp1sAfICn0MXo0PEkUbYEPUCgYEAxm+OowsakHLX6ui19o5Q/1vKjmRQXhUfwoip2YGo5yU1mP1IDrLesymEUWPcDwsn/e/5dniUU2G1+O0krqZUEGImni9qXI30clJNSPTlA8RVzJqgP7CVMt/tdL1zBSCLjPakrvWjxMgXcGYUjisoiGJEbd/IZJXfwGuguirfFDMCgYBND477vIe4+wrV64exdnOeWRM0Cb/XMQZN7w9aSYTYkBMsTe4xA8W2zGQJkegKOafxuTs32tFvwZmNxpy4pboaGAYp7Py5InmP6IE0xZderQdeAIEm/YRcS4wEj07UvZwiNBrGujwoon56DVzxoUh69ApsnkWhdgZZZ8lRJQZJWQKBgBAuSJNC9IeS1chx8WSJdlFcSsgRpfwF/PD/89momP1AK36uKJIKQ96YJBH+8pLHdhte1hiy/GVQMmZ57+PN7Ezps/xyIVoquSQZUfQBBCuqdtSYRzjqTUA4wkQirp5caQS1l/gsT45cQo0HxeVR35w/ZxUOimipT/WA0TpdBJPBAoGAOeUxZspQRabAba4Qku4yxtoNaEaxg8JBJLO8HQcISs3s7AMANyetjYlNZyLQKxsOXOweH9mKI0sW+vwQFqcyeJhLFLaLwgFhw0DabOMV1kWavKztD+KhbDSOQBgfQNpFTNhVLMWDNC9e3gVvEE78gU3ukKQFmwWmJ4Vrup9PkRY=`;
const publicKey = `MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAmmC5cXh7zjQTKroOT885tZO3kc023MPKGNdJhjvV9OTRQ1y/MRTTRl/9YGlaYXrr1ud+jtkAuFGLJR+FbAX29JdbWkSyt0TL1QPrQF3zsZ9ihv03xUcdcRSQwlcogrBWcMmvmfbX2+ck5GbfAl8Pz9s1Cx7slQIk03xkA7YeDd5AKRTZiQhTLFJ4YI/q0XhZ+vYKHOwW/7z8KiswlBV1MTtkRuEpd+8x353HT6TVsi7VBO8d9OdxHfuTXK0Tw30WqJO9+ydAoWOYwE3WigS6/uc9xYXUccYpqbD79DDbAM/UVm76vdL8uYYQ6Ef7CZu+W++j+OEUMgU8BB169cmEzwIDAQAB`;
const timestamp = new Date().toISOString();
const clientKey = 'ABG';
const httpMethod = 'POST';
const path = '/transaction/transfer-inquiry';
const bodyData = {
  destinationAccountNumber: '5432154321',
  destinationBankCode: '014',
  amount: 10000,
  merchantId: 'A4QZ',
  channelId: 'CH-FRP-01',
  partnerReferenceNo: 'ts-out-07',
};

console.log('📋 Test Parameters:');
console.log(`   Client Key: ${clientKey}`);
console.log(`   Body: ${JSON.stringify(bodyData)}`);
console.log(`   HttpMethod: ${httpMethod}`);
console.log(`   Path: ${path}`);
console.log(`   Private Key: ${privateKey.substring(0, 50)}...`);
console.log(`   Public Key: ${publicKey.substring(0, 50)}...`);
console.log(`   Timestamp: ${timestamp}`);
console.log('   Request Body:', JSON.stringify(bodyData, null, 2));

// Generate signature
console.log('\n🔐 Generating signature...');
const signature = generateTransferSignature({
  body: bodyData,
  clientKey,
  httpMethod,
  path,
  timestamp,
  privateKey,
});
console.log(`   Generated Signature: ${signature}`);

// Verify signature
console.log('\n🔍 Verifying signature...');
const verifyResult = verifySignatureTransaction({
  body: bodyData,
  clientKey,
  httpMethod,
  path,
  timestamp,
  signature,
  publicKey,
});

// Simulate the complete transfer-out request
// console.log('\n📤 Simulating Transfer-Out Request:');
// const transferOutRequest = {
//   ...bodyData,
//   signature: signature,
// };

if (verifyResult) {
  console.log('\n✅ Transfer-Out request would be processed successfully!');
  console.log('   Signature verification passed');
  console.log('   Timestamp validation passed');
} else {
  console.log('\n❌ Transfer-Out request would be rejected!');
  console.log('   Signature verification failed');
}

console.log('\n🎉 Test completed!');
