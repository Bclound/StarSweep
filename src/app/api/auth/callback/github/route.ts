import { NextRequest, NextResponse } from "next/server";
import { getAppConfig, getGitHubCallbackUrl } from "@/lib/config";
import { getAuthenticatedUser } from "@/lib/github";
import { exchangeCodeForToken } from "@/lib/oauth";
import { OAUTH_STATE_COOKIE, sealSession, SESSION_COOKIE } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const config = getAppConfig();
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expectedState = request.cookies.get(OAUTH_STATE_COOKIE)?.value;

  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(new URL("/?auth=failed", request.url));
  }

  try {
    const token = await exchangeCodeForToken({
      code,
      clientId: config.githubClientId,
      clientSecret: config.githubClientSecret,
      redirectUri: getGitHubCallbackUrl(config.appUrl)
    });
    const user = await getAuthenticatedUser(token);
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.delete(OAUTH_STATE_COOKIE);
    response.cookies.set(SESSION_COOKIE, await sealSession({ accessToken: token, login: user.login }, config.sessionSecret), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 8 * 60 * 60
    });
    return response;
  } catch {
    return NextResponse.redirect(new URL("/?auth=failed", request.url));
  }
}
