export const DEFAULT_SINGLE_USER = {
  email: process.env.CAREEROS_SINGLE_USER_EMAIL ?? "jun@example.com",
  name: process.env.CAREEROS_SINGLE_USER_NAME ?? "Jun",
  timezone: process.env.CAREEROS_SINGLE_USER_TIMEZONE ?? "Asia/Seoul",
  locale: process.env.CAREEROS_SINGLE_USER_LOCALE ?? "ko-KR"
};

