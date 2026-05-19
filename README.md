# GitHub Star Manager

Local web app for reviewing your GitHub starred repositories and batch unstarring selected repositories.

## Setup

1. Create a GitHub OAuth app at https://github.com/settings/developers.
2. Set the callback URL to:

   ```text
   http://localhost:3000/api/auth/callback/github
   ```

3. Copy `.env.example` to `.env.local` and fill in:

   ```bash
   GITHUB_CLIENT_ID=
   GITHUB_CLIENT_SECRET=
   SESSION_SECRET=replace-with-at-least-32-random-characters
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. Install and run:

   ```bash
   npm install
   npm run dev
   ```

5. Open http://localhost:3000.

## Scripts

```bash
npm test
npm run build
npm run dev
```

## Safety Model

The app does not include an "unstar everything" command. You must explicitly select repositories, review a confirmation dialog, and confirm the destructive action before any star is removed.

The GitHub token is stored in an HTTP-only encrypted session cookie and is not exposed to browser JavaScript.
