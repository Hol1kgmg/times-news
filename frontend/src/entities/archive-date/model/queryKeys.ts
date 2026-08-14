export const archiveDateKeys = {
  all: ["archive-date"] as const,
  list: () => [...archiveDateKeys.all, "list"] as const,
};
