const BOOKMARKS_KEY = "daily-cn-bookmarks";
const READ_KEY = "daily-cn-read";

function readSet(key: string): Set<string> {
  if (typeof window === "undefined") {
    return new Set();
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return new Set();
  }

  try {
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function writeSet(key: string, values: Set<string>): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify([...values]));
}

export function getBookmarks(): Set<string> {
  return readSet(BOOKMARKS_KEY);
}

export function toggleBookmark(id: string): Set<string> {
  const next = getBookmarks();
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  writeSet(BOOKMARKS_KEY, next);
  return next;
}

export function getReadItems(): Set<string> {
  return readSet(READ_KEY);
}

export function toggleRead(id: string): Set<string> {
  const next = getReadItems();
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  writeSet(READ_KEY, next);
  return next;
}
