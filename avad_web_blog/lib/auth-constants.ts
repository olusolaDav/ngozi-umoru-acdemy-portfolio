export const AUTH_COOKIE_KEYS = {
  accessToken: "avad_access_token",
  refreshToken: "avad_refresh_token",
  role: "avad_user_role",
  rememberMe: "avad_remember_me",
  forcePasswordChange: "avad_force_password_change",
  passwordChangeToken: "avad_password_change_token",
} as const;

export const DASHBOARD_HOME_BY_ROLE: Record<string, string> = {
  ADMIN: "/dashboard",
  MODERATOR: "/dashboard",
  BLOGGER: "/dashboard",
  MEMBER: "/community",
};
