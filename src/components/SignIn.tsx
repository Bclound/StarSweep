import { Github } from "lucide-react";

export function SignIn({ error }: { error?: string }) {
  return (
    <main className="signin-shell">
      <section className="signin-panel">
        <div className="signin-mark">
          <Github size={34} aria-hidden="true" />
        </div>
        <h1>GitHub Star Manager</h1>
        <p>
          Review your starred repositories, select the ones you no longer need, and unstar them
          in a controlled batch.
        </p>
        {error ? <div className="notice danger">{error}</div> : null}
        <a className="primary-button" href="/api/auth/login">
          <Github size={18} aria-hidden="true" />
          Sign in with GitHub
        </a>
      </section>
    </main>
  );
}
