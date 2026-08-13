export const sampleItemKeys = {
  all: ["sample-item"] as const,
  list: () => [...sampleItemKeys.all, "list"] as const,
};
