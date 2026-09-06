const MOBILE_USER_AGENT_PATTERN = /Mobi|Android|iPhone|iPad|iPod/i;

export const isMobileUserAgent = (userAgent: string | undefined): boolean =>
  userAgent !== undefined && MOBILE_USER_AGENT_PATTERN.test(userAgent);
