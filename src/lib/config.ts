export type AppConfig = {
  appUrl: string;
  githubClientId: string;
  githubClientSecret: string;
  sessionSecret: string;
};

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getAppConfig(): AppConfig {
  return {
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    githubClientId: requiredEnv("GITHUB_CLIENT_ID"),
    githubClientSecret: requiredEnv("GITHUB_CLIENT_SECRET"),
    sessionSecret: requiredEnv("SESSION_SECRET")
  };
}

export function getGitHubCallbackUrl(appUrl: string): string {
  return `${appUrl.replace(/\/$/, "")}/api/auth/callback/github`;
}
