import * as jose from 'jose';

const TOKEN_EXPIRY = '7d';

export async function createToken(jwtSecret: string): Promise<string> {
  const secret = new TextEncoder().encode(jwtSecret);
  return new jose.SignJWT({ sub: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(secret);
}

export async function verifyToken(token: string, jwtSecret: string): Promise<boolean> {
  try {
    const secret = new TextEncoder().encode(jwtSecret);
    await jose.jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}
