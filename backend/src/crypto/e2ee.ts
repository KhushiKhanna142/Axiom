import nacl from 'tweetnacl';
import { encodeBase64, decodeBase64 } from 'tweetnacl-util';
import crypto from 'crypto';

export function generateKeypair() {
  const kp = nacl.box.keyPair();
  return {
    publicKey: encodeBase64(kp.publicKey),
    secretKey: encodeBase64(kp.secretKey),
  };
}

export async function encryptPrivateKey(secretKey: string, password: string) {
  const salt = crypto.randomBytes(32);
  const dk = await scryptKey(password, salt);
  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
  const encrypted = nacl.secretbox(decodeBase64(secretKey), nonce, dk);
  return {
    encrypted: encodeBase64(encrypted) + '.' + encodeBase64(nonce),
    salt: encodeBase64(salt),
  };
}

async function scryptKey(password: string, salt: Buffer): Promise<Uint8Array> {
  return new Promise((res, rej) =>
    crypto.scrypt(password, salt, 32, (err, key) => (err ? rej(err) : res(new Uint8Array(key))))
  );
}
