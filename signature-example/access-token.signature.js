import * as crypto from 'crypto';

// function generateSignature(timestamp, clientKey, privateKeyPem) {
//   const data = `${timestamp}:${clientKey}`;
//   const sign = crypto.createSign('RSA-SHA256');
//   sign.update(data);
//   sign.end();
//   const privateKeyBuffer = Buffer.from(privateKeyPem, 'base64');
//   return sign.sign({ key: privateKeyBuffer, format: 'der', type: 'pkcs1' }, 'base64');
// }

function derBase64ToPem(derBase64, label = 'RSA PRIVATE KEY') {
  const derBuffer = Buffer.from(derBase64, 'base64');
  const base64Lines = derBuffer
    .toString('base64')
    .match(/.{1,64}/g)
    .join('\n');
  return `-----BEGIN ${label}-----\n${base64Lines}\n-----END ${label}-----\n`;
}

function generateSignature(timestamp, clientKey, privateKeyPem, httpMethod, path) {
  const data = `${httpMethod}:${path}:${timestamp}:${clientKey}`;
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(data);
  sign.end();
  const pemKey = derBase64ToPem(privateKeyPem);
  // console.log(pemKey);
  return sign.sign(pemKey, 'base64');
}

function verifySignatureAuth({ clientKey, signature, timestamp, publicKey, httpMethod, path }) {
  const data = `${httpMethod}:${path}:${timestamp}:${clientKey}`;
  const now = Date.now();
  const ts = Date.parse(timestamp);

  if (isNaN(ts)) return false;

  const THIRTY_MINUTES_MS = 30 * 60 * 1000;
  if (Math.abs(now - ts) > THIRTY_MINUTES_MS) return false;

  const verify = crypto.createVerify('RSA-SHA256');
  verify.update(data);
  verify.end();

  // Decode the Base64-encoded DER public key into a Buffer
  const publicKeyBuffer = Buffer.from(publicKey, 'base64');

  // Use the Buffer directly for verification
  return verify.verify({ key: publicKeyBuffer, format: 'der', type: 'spki' }, signature, 'base64');
}

// Example usage:
const timestamp = new Date().toISOString();
const clientKey = 'ABG';
const httpMethod = 'GET';
const path = '/auth/access-token';
const privateKeyPem = `MIIEogIBAAKCAQEAmmC5cXh7zjQTKroOT885tZO3kc023MPKGNdJhjvV9OTRQ1y/MRTTRl/9YGlaYXrr1ud+jtkAuFGLJR+FbAX29JdbWkSyt0TL1QPrQF3zsZ9ihv03xUcdcRSQwlcogrBWcMmvmfbX2+ck5GbfAl8Pz9s1Cx7slQIk03xkA7YeDd5AKRTZiQhTLFJ4YI/q0XhZ+vYKHOwW/7z8KiswlBV1MTtkRuEpd+8x353HT6TVsi7VBO8d9OdxHfuTXK0Tw30WqJO9+ydAoWOYwE3WigS6/uc9xYXUccYpqbD79DDbAM/UVm76vdL8uYYQ6Ef7CZu+W++j+OEUMgU8BB169cmEzwIDAQABAoIBACjm/7tExOi5e2qSqUAUE6I8ZSLIUITliyJRyDU8nU+pYJiMdku2zNOUkzl8MGore1kRNML8U+iCEm/fjiY03l2nzJh6Iy/Tln3179q6CdtB84T4ilJGqVJQtJoJJb6aogx4I4KTmFW3RFsPtn6WWUYlOkScCOriCofOKWGiWwwpMVZtwBURKETct/7uCDiL48FM0vMmzHcubdVtAtdj8d8PX0s0Rf6Q2u2+ByEX/m6ZpVsp9SAwTS3Kr4Hzcu+bquCZ36Poonoi60RXxbSpBSenWhoXLFM24Hl+s+wk1RrrkGJyGbe2Cz8BbW50HwuSfwwt4s+IVQSDWpH3yv8fLyECgYEAxylKb8WP6mIgMactLU9M6kLtngsk5fE8QlxoCXVHravC01QpGROiBGxAbbyef+f0UstfNf2haV3Mv9Cd90MKjtoGCVwoXN6xLcDQV53AryO8/zYVMf/U+Kt2yLC+pIUGuL+ztQV14hBDznMy7m+tQp1sAfICn0MXo0PEkUbYEPUCgYEAxm+OowsakHLX6ui19o5Q/1vKjmRQXhUfwoip2YGo5yU1mP1IDrLesymEUWPcDwsn/e/5dniUU2G1+O0krqZUEGImni9qXI30clJNSPTlA8RVzJqgP7CVMt/tdL1zBSCLjPakrvWjxMgXcGYUjisoiGJEbd/IZJXfwGuguirfFDMCgYBND477vIe4+wrV64exdnOeWRM0Cb/XMQZN7w9aSYTYkBMsTe4xA8W2zGQJkegKOafxuTs32tFvwZmNxpy4pboaGAYp7Py5InmP6IE0xZderQdeAIEm/YRcS4wEj07UvZwiNBrGujwoon56DVzxoUh69ApsnkWhdgZZZ8lRJQZJWQKBgBAuSJNC9IeS1chx8WSJdlFcSsgRpfwF/PD/89momP1AK36uKJIKQ96YJBH+8pLHdhte1hiy/GVQMmZ57+PN7Ezps/xyIVoquSQZUfQBBCuqdtSYRzjqTUA4wkQirp5caQS1l/gsT45cQo0HxeVR35w/ZxUOimipT/WA0TpdBJPBAoGAOeUxZspQRabAba4Qku4yxtoNaEaxg8JBJLO8HQcISs3s7AMANyetjYlNZyLQKxsOXOweH9mKI0sW+vwQFqcyeJhLFLaLwgFhw0DabOMV1kWavKztD+KhbDSOQBgfQNpFTNhVLMWDNC9e3gVvEE78gU3ukKQFmwWmJ4Vrup9PkRY=`;
const publicKey = `MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAmmC5cXh7zjQTKroOT885tZO3kc023MPKGNdJhjvV9OTRQ1y/MRTTRl/9YGlaYXrr1ud+jtkAuFGLJR+FbAX29JdbWkSyt0TL1QPrQF3zsZ9ihv03xUcdcRSQwlcogrBWcMmvmfbX2+ck5GbfAl8Pz9s1Cx7slQIk03xkA7YeDd5AKRTZiQhTLFJ4YI/q0XhZ+vYKHOwW/7z8KiswlBV1MTtkRuEpd+8x353HT6TVsi7VBO8d9OdxHfuTXK0Tw30WqJO9+ydAoWOYwE3WigS6/uc9xYXUccYpqbD79DDbAM/UVm76vdL8uYYQ6Ef7CZu+W++j+OEUMgU8BB169cmEzwIDAQAB`;
const signature = generateSignature(timestamp, clientKey, privateKeyPem, httpMethod, path);

console.log({ timestamp, clientKey, signature });

const verifySignature = verifySignatureAuth({ clientKey, timestamp, signature, publicKey, httpMethod, path });

console.log('---- verifySignature----  ', verifySignature);
