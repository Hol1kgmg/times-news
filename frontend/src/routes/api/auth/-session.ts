import type { GithubLogin, SessionPayload, SessionSecret } from "./-types";
import { isSessionPayload } from "./-types";

export const SESSION_COOKIE_NAME = "session";
export const OAUTH_STATE_COOKIE_NAME = "oauth_state";
export const OAUTH_LOGIN_KEY_COOKIE_NAME = "oauth_login_key";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const OAUTH_STATE_MAX_AGE_SECONDS = 60 * 10;

const toBase64Url = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...bytes)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");

const fromBase64Url = (value: string): Uint8Array<ArrayBuffer> => {
  const padded = value
    .replaceAll("-", "+")
    .replaceAll("_", "/")
    .padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const importSigningKey = (secret: SessionSecret): Promise<CryptoKey> =>
  crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);

export const createSessionCookieValue = async (
  login: GithubLogin,
  secret: SessionSecret,
): Promise<string> => {
  const payload: SessionPayload = { login, iat: Date.now() };
  const payloadBase64 = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const key = await importSigningKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payloadBase64));
  const signatureBase64 = toBase64Url(new Uint8Array(signature));
  return `${payloadBase64}.${signatureBase64}`;
};

export const verifySessionCookieValue = async (
  value: string,
  secret: SessionSecret,
): Promise<SessionPayload | null> => {
  const [payloadBase64, signatureBase64] = value.split(".");
  if (payloadBase64 === undefined || signatureBase64 === undefined) return null;

  try {
    const key = await importSigningKey(secret);
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      fromBase64Url(signatureBase64),
      new TextEncoder().encode(payloadBase64),
    );
    if (!isValid) return null;

    const decoded: unknown = JSON.parse(new TextDecoder().decode(fromBase64Url(payloadBase64)));
    return isSessionPayload(decoded) ? decoded : null;
  } catch {
    return null;
  }
};

export const buildSessionCookieHeader = (cookieValue: string, secure: boolean): string => {
  const attributes = [
    `${SESSION_COOKIE_NAME}=${cookieValue}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${SESSION_MAX_AGE_SECONDS}`,
  ];
  if (secure) attributes.push("Secure");
  return attributes.join("; ");
};

const extractCookieValue = (cookieHeader: string | null, cookieName: string): string | null => {
  if (cookieHeader === null) return null;

  for (const cookie of cookieHeader.split(";")) {
    const [name, ...rest] = cookie.trim().split("=");
    if (name === cookieName) return rest.join("=");
  }
  return null;
};

export const extractSessionCookieValue = (cookieHeader: string | null): string | null =>
  extractCookieValue(cookieHeader, SESSION_COOKIE_NAME);

export const buildSessionCookieClearHeader = (secure: boolean): string => {
  const attributes = [`${SESSION_COOKIE_NAME}=`, "Path=/", "HttpOnly", "SameSite=Lax", "Max-Age=0"];
  if (secure) attributes.push("Secure");
  return attributes.join("; ");
};

export const createOauthState = (): string => crypto.randomUUID();

export const buildOauthStateCookieHeader = (state: string, secure: boolean): string => {
  const attributes = [
    `${OAUTH_STATE_COOKIE_NAME}=${state}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${OAUTH_STATE_MAX_AGE_SECONDS}`,
  ];
  if (secure) attributes.push("Secure");
  return attributes.join("; ");
};

export const buildOauthStateCookieClearHeader = (secure: boolean): string => {
  const attributes = [`${OAUTH_STATE_COOKIE_NAME}=`, "Path=/", "HttpOnly", "SameSite=Lax", "Max-Age=0"];
  if (secure) attributes.push("Secure");
  return attributes.join("; ");
};

export const extractOauthStateCookieValue = (cookieHeader: string | null): string | null =>
  extractCookieValue(cookieHeader, OAUTH_STATE_COOKIE_NAME);

export const buildOauthLoginKeyCookieHeader = (key: string, secure: boolean): string => {
  const attributes = [
    `${OAUTH_LOGIN_KEY_COOKIE_NAME}=${encodeURIComponent(key)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${OAUTH_STATE_MAX_AGE_SECONDS}`,
  ];
  if (secure) attributes.push("Secure");
  return attributes.join("; ");
};

export const buildOauthLoginKeyCookieClearHeader = (secure: boolean): string => {
  const attributes = [`${OAUTH_LOGIN_KEY_COOKIE_NAME}=`, "Path=/", "HttpOnly", "SameSite=Lax", "Max-Age=0"];
  if (secure) attributes.push("Secure");
  return attributes.join("; ");
};

export const extractOauthLoginKeyCookieValue = (cookieHeader: string | null): string | null => {
  const value = extractCookieValue(cookieHeader, OAUTH_LOGIN_KEY_COOKIE_NAME);
  return value === null ? null : decodeURIComponent(value);
};
