import { EncryptJWT, jwtDecrypt } from "jose";

export const SESSION_COOKIE = "github_star_manager_session";
export const OAUTH_STATE_COOKIE = "github_star_manager_oauth_state";

export type SessionData = {
  accessToken: string;
  login: string;
};

function secretKey(secret: string): Uint8Array {
  return new TextEncoder().encode(secret.padEnd(32, "0").slice(0, 32));
}

export async function sealSession(data: SessionData, secret: string): Promise<string> {
  return new EncryptJWT(data)
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .encrypt(secretKey(secret));
}

export async function unsealSession(value: string | undefined, secret: string): Promise<SessionData | null> {
  if (!value) return null;

  try {
    const { payload } = await jwtDecrypt(value, secretKey(secret));
    if (typeof payload.accessToken !== "string" || typeof payload.login !== "string") {
      return null;
    }

    return {
      accessToken: payload.accessToken,
      login: payload.login
    };
  } catch {
    return null;
  }
}
