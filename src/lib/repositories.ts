export type RepositoryView = {
  id: number;
  owner: string;
  name: string;
  fullName: string;
  description: string | null;
  language: string | null;
  stargazersCount: number;
  pushedAt: string | null;
  archived: boolean;
  private: boolean;
  url: string;
};

export type RepositorySort = "newest-pushed" | "oldest-pushed" | "most-stars" | "name";

export type ArchivedFilter = "all" | "active" | "archived";

export type RepositoryFilters = {
  query: string;
  language: string;
  archived: ArchivedFilter;
};

const timeValue = (value: string | null) => (value ? new Date(value).getTime() : 0);

export function sortRepositories(
  repositories: RepositoryView[],
  sort: RepositorySort
): RepositoryView[] {
  return [...repositories].sort((first, second) => {
    if (sort === "oldest-pushed") {
      return timeValue(first.pushedAt) - timeValue(second.pushedAt);
    }

    if (sort === "most-stars") {
      return second.stargazersCount - first.stargazersCount;
    }

    if (sort === "name") {
      return first.fullName.localeCompare(second.fullName);
    }

    return timeValue(second.pushedAt) - timeValue(first.pushedAt);
  });
}

export function filterRepositories(
  repositories: RepositoryView[],
  filters: RepositoryFilters
): RepositoryView[] {
  const query = filters.query.trim().toLowerCase();

  return repositories.filter((repository) => {
    const matchesQuery =
      query.length === 0 ||
      repository.fullName.toLowerCase().includes(query) ||
      (repository.description ?? "").toLowerCase().includes(query);

    const matchesLanguage =
      filters.language === "all" || repository.language === filters.language;

    const matchesArchived =
      filters.archived === "all" ||
      (filters.archived === "archived" && repository.archived) ||
      (filters.archived === "active" && !repository.archived);

    return matchesQuery && matchesLanguage && matchesArchived;
  });
}

export function getLanguages(repositories: RepositoryView[]): string[] {
  const languages = repositories
    .map((repository) => repository.language)
    .filter((language): language is string => Boolean(language));

  return [...new Set(languages)].sort((first, second) => first.localeCompare(second));
}

export function toggleVisibleSelection(
  selectedIds: Set<number>,
  visibleRepositories: RepositoryView[]
): Set<number> {
  const next = new Set(selectedIds);
  const allVisibleSelected = visibleRepositories.every((repository) => next.has(repository.id));

  for (const repository of visibleRepositories) {
    if (allVisibleSelected) {
      next.delete(repository.id);
    } else {
      next.add(repository.id);
    }
  }

  return next;
}
