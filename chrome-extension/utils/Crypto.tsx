export async function getKeyMaterial(password: string) {
  const enc = new TextEncoder();
  return crypto.subtle.importKey('raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveBits', 'deriveKey']);
}

export async function getKey(keyMaterial: CryptoKey, salt: Uint8Array) {
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt'],
  );
}

export async function encryptData(password: string, data: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const keyMaterial = await getKeyMaterial(password);
  const key = await getKey(keyMaterial, salt);

  const enc = new TextEncoder();
  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    enc.encode(data),
  );

  return {
    salt: Array.from(salt),
    iv: Array.from(iv),
    encrypted: Array.from(new Uint8Array(encrypted)),
  };
}

export async function decryptData(
  password: string,
  encryptedData: { salt: number[]; iv: number[]; encrypted: number[] },
) {
  const { salt, iv, encrypted } = encryptedData;
  const keyMaterial = await getKeyMaterial(password);
  const key = await getKey(keyMaterial, new Uint8Array(salt));

  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: new Uint8Array(iv),
    },
    key,
    new Uint8Array(encrypted),
  );

  const dec = new TextDecoder();
  return dec.decode(decrypted);
}
