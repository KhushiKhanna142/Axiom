import nacl from 'tweetnacl';
import { encodeBase64, decodeBase64, encodeUTF8, decodeUTF8 } from 'tweetnacl-util';

export function encryptDM(message: string, recipientPublicKey: string, senderSecretKey: string) {
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const encrypted = nacl.box(
    decodeUTF8(message),
    nonce,
    decodeBase64(recipientPublicKey),
    decodeBase64(senderSecretKey)
  );
  return { ciphertext: encodeBase64(encrypted), nonce: encodeBase64(nonce) };
}

export function decryptDM(
  ciphertext: string,
  nonce: string,
  senderPublicKey: string,
  mySecretKey: string
): string | null {
  try {
    const dec = nacl.box.open(
      decodeBase64(ciphertext),
      decodeBase64(nonce),
      decodeBase64(senderPublicKey),
      decodeBase64(mySecretKey)
    );
    return dec ? encodeUTF8(dec) : null;
  } catch {
    return null;
  }
}
