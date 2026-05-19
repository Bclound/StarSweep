# GitHub Star Manager MVP Design

## Goal

Build a local web application that lets a GitHub user sign in, review their starred repositories, select repositories they no longer need, and batch unstar the selected repositories with a clear confirmation step.

## Scope

The MVP focuses on one user's own GitHub account. It provides OAuth sign-in, starred repository import, filtering, selection, and batch unstar execution. It does not manage multiple GitHub accounts, persist long-term repository history, recommend removals automatically, or run background jobs.

## Recommended Approach

Use a Next.js full-stack app with TypeScript. The app will keep UI, OAuth callback handling, and GitHub API routes in one project. This keeps the first version small while still leaving clean boundaries for future improvements.

Alternatives considered:

- React plus Express: clear separation, but heavier for a single-user local tool.
- CLI-only: fastest to build, but poor fit for reviewing hundreds of repositories and selecting many at once.

## Architecture

The app has four main parts:

- Authentication routes handle GitHub OAuth login and callback.
- A server-side GitHub client wraps GitHub REST API calls.
- API routes expose signed-in user, starred repository pagination, and batch unstar actions to the UI.
- The main dashboard renders filters, repository rows, selection controls, and confirmation state.

The GitHub access token is stored only in an HTTP-only encrypted session cookie. The browser never receives the token directly.

## Authentication

The app uses GitHub OAuth with a local callback URL:

`http://localhost:3000/api/auth/callback/github`

Required environment variables:

- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `SESSION_SECRET`

The OAuth scope should be the minimum needed for starred repository management. For public repositories, GitHub's `public_repo` scope can unstar public repositories. If a user needs to manage private repository stars, they can configure broader repository access deliberately.

## Data Flow

1. User opens the app.
2. If unauthenticated, the app shows a sign-in button.
3. User signs in with GitHub.
4. The callback exchanges the temporary code for an access token.
5. Dashboard requests `/api/stars`.
6. Server calls GitHub's starred repositories endpoint with pagination.
7. UI displays repositories and lets the user search, filter, sort, and select rows.
8. User confirms a batch unstar action.
9. Server calls GitHub's unstar endpoint for each selected repository.
10. UI shows success and failure counts, then removes successfully unstarred repositories from the visible list.

## Repository List

Each repository row should show:

- Owner and repository name
- Description
- Primary language
- Star count
- Last pushed date
- Archived status
- Private status when returned by GitHub
- Link to GitHub

The dashboard should include:

- Search by owner/name/description
- Language filter
- Archived filter
- Sort by recently pushed, least recently pushed, most starred, and name
- Per-row selection
- Select all visible rows
- Selected count

## Batch Unstar Safety

Batch unstar is destructive, so the MVP requires:

- Explicit row selection.
- Disabled action when no rows are selected.
- Confirmation dialog listing the selected count and at least the first several selected repository names.
- A clear final button labelled as an unstar action.
- Result reporting with succeeded and failed repositories.

The MVP intentionally avoids a single "unstar everything" command.

## Error Handling

Authentication errors should return the user to the signed-out state with a readable message.

GitHub API failures should be normalized into UI-friendly errors:

- Unauthorized: ask the user to sign in again.
- Rate limited: show that GitHub rate limits were hit and suggest waiting.
- Network or unexpected API errors: show a retryable error.
- Batch unstar partial failure: preserve failed repositories in the list and report their names.

## Testing

Core server behavior should be unit-tested:

- OAuth state generation and validation.
- GitHub client request construction for listing stars and unstarring repositories.
- Batch unstar aggregation of success and failure results.

UI logic should be tested where practical:

- Filtering, sorting, and selection reducers/helpers.
- Confirmation state behavior.

End-to-end manual verification should cover:

- Signed-out landing state.
- OAuth redirect URL generation.
- Dashboard rendering with mocked or real GitHub data.
- Batch unstar behavior using a test repository or mocked API.

## Initial Project Setup

Create a new Next.js TypeScript app in the current directory. Use the App Router and a minimal custom CSS design. Keep the interface dense and operational rather than marketing-like: this is a management tool for reviewing many repositories.

## Future Enhancements

Possible follow-up features after the MVP:

- Tagging repositories as keep/remove candidates before committing changes.
- Export selected repositories to CSV before unstarring.
- Saved review sessions.
- Heuristics such as "not pushed in 5 years" or "archived".
- Dry-run report mode.
