export type Fetcher = typeof fetch;

export type GitHubUser = {
  login: string;
  avatar_url: string;
  html_url: string;
};

export type GitHubRepositoryResponse = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  pushed_at: string | null;
  archived: boolean;
  private: boolean;
  owner: {
    login: string;
  };
};

export type GitHubApiErrorCode =
  | "unauthorized"
  | "rate_limited"
  | "not_found"
  | "github_error"
  | "network_error";

export class GitHubApiError extends Error {
  constructor(
    public readonly code: GitHubApiErrorCode,
    message: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = "GitHubApiError";
  }
}

const API_ROOT = "https://api.github.com";

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function errorCodeFor(status: number, body: unknown): GitHubApiErrorCode {
  const message =
    typeof body === "object" && body && "message" in body
      ? String((body as { message: unknown }).message)
      : "";

  if (status === 401) return "unauthorized";
  if (status === 404) return "not_found";
  if (status === 403 && message.toLowerCase().includes("rate limit")) return "rate_limited";
  return "github_error";
}

async function githubRequest<T>(
  token: string,
  path: string,
  init: RequestInit = {},
  fetcher: Fetcher = fetch
): Promise<T> {
  let response: Response;

  try {
    response = await fetcher(`${API_ROOT}${path}`, {
      ...init,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        ...init.headers
      }
    });
  } catch (error) {
    throw new GitHubApiError(
      "network_error",
      error instanceof Error ? error.message : "Network request failed"
    );
  }

  if (!response.ok) {
    const body = await parseBody(response);
    const message =
      typeof body === "object" && body && "message" in body
        ? String((body as { message: unknown }).message)
        : `GitHub API returned ${response.status}`;
    throw new GitHubApiError(errorCodeFor(response.status, body), message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await parseBody(response)) as T;
}

export async function listStarredRepositories(
  token: string,
  page = 1,
  fetcher: Fetcher = fetch
): Promise<GitHubRepositoryResponse[]> {
  return githubRequest<GitHubRepositoryResponse[]>(
    token,
    `/user/starred?per_page=100&page=${page}&sort=created&direction=desc`,
    {},
    fetcher
  );
}

export async function unstarRepository(
  token: string,
  owner: string,
  repo: string,
  fetcher: Fetcher = fetch
): Promise<void> {
  await githubRequest<void>(
    token,
    `/user/starred/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
    { method: "DELETE" },
    fetcher
  );
}

export async function getAuthenticatedUser(
  token: string,
  fetcher: Fetcher = fetch
): Promise<GitHubUser> {
  return githubRequest<GitHubUser>(token, "/user", {}, fetcher);
}
