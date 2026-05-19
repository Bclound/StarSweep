import { randomBytes } from "crypto";

type AuthorizationUrlInput = {
  clientId: string;
  redirectUri: string;
  state: string;
  scope?: string;
};

type TokenExchangeInput = {
  code: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  fetcher?: typeof fetch;
};

export function createOAuthState(): string {
  return randomBytes(32).toString("base64url");
}

export function buildGitHubAuthorizationUrl({
  clientId,
  redirectUri,
  state,
  scope = "public_repo"
}: AuthorizationUrlInput): string {
  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("scope", scope);
  return url.toString();
}

export async function exchangeCodeForToken({
  code,
  clientId,
  clientSecret,
  redirectUri,
  fetcher = fetch
}: TokenExchangeInput): Promise<string> {
  const response = await fetcher("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri
    })
  });

  const payload = (await response.json()) as { access_token?: string; error_description?: string };

  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error_description ?? "GitHub OAuth token exchange failed");
  }

  return payload.access_token;
}
