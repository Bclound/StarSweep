import { NextResponse } from "next/server";
import { getAppConfig, getGitHubCallbackUrl } from "@/lib/config";
import { buildGitHubAuthorizationUrl, createOAuthState } from "@/lib/oauth";
import { OAUTH_STATE_COOKIE } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const config = getAppConfig();
  const state = createOAuthState();
  const redirectUri = getGitHubCallbackUrl(config.appUrl);
  const response = NextResponse.redirect(
    buildGitHubAuthorizationUrl({
      clientId: config.githubClientId,
      redirectUri,
      state,
      scope: "public_repo"
    })
  );

  response.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 10 * 60
  });

  return response;
}
