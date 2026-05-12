export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    me: () => ["auth", "me"] as const,
  },

  users: {
    all: ["users"] as const,
    lists: () => ["users", "list"] as const,
    list: (params?: unknown) => ["users", "list", params] as const,
    detail: (id: string) => ["users", "detail", id] as const,
  },

  categories: {
    all: ["categories"] as const,
    lists: () => ["categories", "list"] as const,
    list: (params?: unknown) => ["categories", "list", params] as const,
    detail: (id: string) => ["categories", "detail", id] as const,
  },

  questions: {
    all: ["questions"] as const,
    lists: () => ["questions", "list"] as const,
    list: (params?: unknown) => ["questions", "list", params] as const,
    detail: (id: string) => ["questions", "detail", id] as const,
  },

  quizzes: {
    all: ["quizzes"] as const,
    lists: () => ["quizzes", "list"] as const,
    list: (params?: unknown) => ["quizzes", "list", params] as const,
    detail: (id: string) => ["quizzes", "detail", id] as const,
    adminLists: () => ["quizzes", "admin", "list"] as const,
    adminList: (params?: unknown) =>
      ["quizzes", "admin", "list", params] as const,
  },

  attempts: {
    all: ["attempts"] as const,
    myHistory: (params?: unknown) =>
      ["attempts", "my-history", params] as const,
    result: (attemptId: string) => ["attempts", "result", attemptId] as const,
    events: (attemptId: string, params?: unknown) =>
      ["attempts", "events", attemptId, params] as const,
  },

  admin: {
    all: ["admin"] as const,
    dashboard: (params?: unknown) => ["admin", "dashboard", params] as const,
    recentAttempts: (params?: unknown) =>
      ["admin", "recent-attempts", params] as const,
    topQuizzes: (params?: unknown) => ["admin", "top-quizzes", params] as const,
    suspiciousAttempts: (params?: unknown) =>
      ["admin", "suspicious-attempts", params] as const,
  },
};
