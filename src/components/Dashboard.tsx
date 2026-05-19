"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Github, Loader2, LogOut, Search, Star, Trash2 } from "lucide-react";
import {
  filterRepositories,
  getLanguages,
  sortRepositories,
  toggleVisibleSelection,
  type ArchivedFilter,
  type RepositorySort,
  type RepositoryView
} from "@/lib/repositories";
import { SignIn } from "./SignIn";

type User = {
  login: string;
  avatarUrl: string;
  profileUrl: string;
};

type BatchResult = {
  succeeded: string[];
  failed: Array<{ fullName: string; message: string }>;
};

export function Dashboard({ authFailed = false }: { authFailed?: boolean }) {
  const [user, setUser] = useState<User | null>(null);
  const [repositories, setRepositories] = useState<RepositoryView[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState("all");
  const [archived, setArchived] = useState<ArchivedFilter>("all");
  const [sort, setSort] = useState<RepositorySort>("oldest-pushed");
  const [loading, setLoading] = useState(true);
  const [loadingStars, setLoadingStars] = useState(false);
  const [error, setError] = useState<string | null>(authFailed ? "GitHub sign-in failed." : null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busyUnstar, setBusyUnstar] = useState(false);
  const [result, setResult] = useState<BatchResult | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const meResponse = await fetch("/api/me");

      if (meResponse.status === 401) {
        if (!cancelled) {
          setLoading(false);
        }
        return;
      }

      if (!meResponse.ok) {
        if (!cancelled) {
          setError("Unable to load your GitHub account.");
          setLoading(false);
        }
        return;
      }

      const me = (await meResponse.json()) as User;
      if (cancelled) return;
      setUser(me);
      setLoadingStars(true);

      try {
        const all: RepositoryView[] = [];
        for (let page = 1; page < 100; page += 1) {
          const response = await fetch(`/api/stars?page=${page}`);
          if (!response.ok) {
            throw new Error("Unable to load starred repositories.");
          }
          const payload = (await response.json()) as { repositories: RepositoryView[] };
          all.push(...payload.repositories);
          if (payload.repositories.length < 100) break;
        }
        if (!cancelled) setRepositories(all);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load stars.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setLoadingStars(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const languages = useMemo(() => getLanguages(repositories), [repositories]);
  const visibleRepositories = useMemo(
    () =>
      sortRepositories(
        filterRepositories(repositories, { query, language, archived }),
        sort
      ),
    [archived, language, query, repositories, sort]
  );
  const selectedRepositories = repositories.filter((repository) => selectedIds.has(repository.id));

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.reload();
  }

  async function unstarSelected() {
    setBusyUnstar(true);
    setResult(null);

    const response = await fetch("/api/unstar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        repositories: selectedRepositories.map((repository) => ({
          owner: repository.owner,
          repo: repository.name,
          fullName: repository.fullName
        }))
      })
    });

    const payload = (await response.json()) as BatchResult | { error: string };
    setBusyUnstar(false);
    setConfirmOpen(false);

    if (!response.ok || "error" in payload) {
      setError("error" in payload ? payload.error : "Batch unstar failed.");
      return;
    }

    const succeeded = new Set(payload.succeeded);
    setRepositories((current) => current.filter((repository) => !succeeded.has(repository.fullName)));
    setSelectedIds((current) => {
      const next = new Set(current);
      for (const repository of selectedRepositories) {
        if (succeeded.has(repository.fullName)) next.delete(repository.id);
      }
      return next;
    });
    setResult(payload);
  }

  if (loading && !user) {
    return (
      <main className="loading-shell">
        <Loader2 className="spin" size={28} aria-hidden="true" />
        <span>Loading account</span>
      </main>
    );
  }

  if (!user) {
    return <SignIn error={error ?? undefined} />;
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <Github size={24} aria-hidden="true" />
          <div>
            <h1>GitHub Star Manager</h1>
            <span>{repositories.length} starred repositories loaded</span>
          </div>
        </div>
        <div className="account">
          <img src={user.avatarUrl} alt="" />
          <a href={user.profileUrl} target="_blank" rel="noreferrer">
            {user.login}
          </a>
          <button className="icon-button" onClick={logout} title="Sign out" type="button">
            <LogOut size={18} aria-hidden="true" />
          </button>
        </div>
      </header>

      {error ? <div className="notice danger">{error}</div> : null}
      {result ? (
        <div className="notice">
          Unstarred {result.succeeded.length} repositories. Failed: {result.failed.length}.
        </div>
      ) : null}

      <section className="toolbar">
        <label className="search-box">
          <Search size={17} aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search owner, name, or description"
          />
        </label>
        <select value={language} onChange={(event) => setLanguage(event.target.value)}>
          <option value="all">All languages</option>
          {languages.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select value={archived} onChange={(event) => setArchived(event.target.value as ArchivedFilter)}>
          <option value="all">All repos</option>
          <option value="active">Active only</option>
          <option value="archived">Archived only</option>
        </select>
        <select value={sort} onChange={(event) => setSort(event.target.value as RepositorySort)}>
          <option value="oldest-pushed">Least recently pushed</option>
          <option value="newest-pushed">Recently pushed</option>
          <option value="most-stars">Most starred</option>
          <option value="name">Name</option>
        </select>
      </section>

      <section className="bulkbar">
        <label className="checkline">
          <input
            type="checkbox"
            checked={
              visibleRepositories.length > 0 &&
              visibleRepositories.every((repository) => selectedIds.has(repository.id))
            }
            onChange={() => setSelectedIds(toggleVisibleSelection(selectedIds, visibleRepositories))}
          />
          Select visible
        </label>
        <span>
          Showing {visibleRepositories.length} · Selected {selectedIds.size}
        </span>
        <button
          className="danger-button"
          type="button"
          disabled={selectedIds.size === 0}
          onClick={() => setConfirmOpen(true)}
        >
          <Trash2 size={17} aria-hidden="true" />
          Unstar selected
        </button>
      </section>

      <section className="repo-list">
        {loadingStars ? (
          <div className="empty-state">
            <Loader2 className="spin" size={22} aria-hidden="true" />
            Loading starred repositories
          </div>
        ) : null}
        {!loadingStars && visibleRepositories.length === 0 ? (
          <div className="empty-state">No repositories match the current filters.</div>
        ) : null}
        {visibleRepositories.map((repository) => (
          <article className="repo-row" key={repository.id}>
            <input
              type="checkbox"
              checked={selectedIds.has(repository.id)}
              onChange={() =>
                setSelectedIds((current) => {
                  const next = new Set(current);
                  if (next.has(repository.id)) next.delete(repository.id);
                  else next.add(repository.id);
                  return next;
                })
              }
            />
            <div className="repo-main">
              <div className="repo-title">
                <a href={repository.url} target="_blank" rel="noreferrer">
                  {repository.fullName}
                  <ExternalLink size={14} aria-hidden="true" />
                </a>
                {repository.archived ? <span className="chip warning">archived</span> : null}
                {repository.private ? <span className="chip">private</span> : null}
              </div>
              <p>{repository.description || "No description"}</p>
              <div className="repo-meta">
                <span>{repository.language || "Unknown"}</span>
                <span>
                  <Star size={14} aria-hidden="true" />
                  {repository.stargazersCount.toLocaleString()}
                </span>
                <span>Pushed {repository.pushedAt ? new Date(repository.pushedAt).toLocaleDateString() : "unknown"}</span>
              </div>
            </div>
          </article>
        ))}
      </section>

      {confirmOpen ? (
        <div className="modal-backdrop" role="presentation">
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
            <h2 id="confirm-title">Unstar {selectedRepositories.length} repositories?</h2>
            <p>This removes them from your GitHub starred list. It cannot be undone from this app.</p>
            <ul>
              {selectedRepositories.slice(0, 8).map((repository) => (
                <li key={repository.id}>{repository.fullName}</li>
              ))}
            </ul>
            {selectedRepositories.length > 8 ? <p>And {selectedRepositories.length - 8} more.</p> : null}
            <div className="modal-actions">
              <button type="button" onClick={() => setConfirmOpen(false)}>
                Cancel
              </button>
              <button className="danger-button" type="button" onClick={unstarSelected} disabled={busyUnstar}>
                {busyUnstar ? <Loader2 className="spin" size={17} aria-hidden="true" /> : <Trash2 size={17} aria-hidden="true" />}
                Confirm unstar
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
