export const sessionKeys = {
  all: ["session"] as const,
  status: () => [...sessionKeys.all, "status"] as const,
};
