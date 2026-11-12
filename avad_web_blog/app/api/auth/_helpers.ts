import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_KEYS } from "@/lib/auth-constants";
import { callApi } from "@/lib/server-api";

const baseCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

type LoginResult = {
  requiresPasswordChange: boolean;
  requiresTwoFactor?: boolean;
  passwordChangeToken?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: {
    id: string;
    email: string;
    role: string;
  };
};

// Several dashboard requests can discover an expired access token at the same
// time. Share one refresh request so token rotation cannot make the other
// requests revoke the newly-issued session.
const refreshRequests = new Map<string, Promise<LoginResult>>();

function isJwtExpired(token: string, skewSeconds = 30) {
  try {
    const [, payload] = token.split(".");
    if (!payload) {
      return true;
    }

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = Buffer.from(normalized, "base64").toString("utf8");
    const parsed = JSON.parse(decoded) as { exp?: number };

    if (!parsed.exp) {
      return false;
    }

    const now = Math.floor(Date.now() / 1000);
    return now >= parsed.exp - skewSeconds;
  } catch {
    return true;
  }
}

function isJwtExpiredStrict(token: string) {
  return isJwtExpired(token, 0);
}

export async function setAuthCookies(loginResult: LoginResult, remember = false) {
  const store = await cookies();

  const persistenceOptions = { maxAge: 60 * 60 * 24 * 7 };

  store.delete(AUTH_COOKIE_KEYS.passwordChangeToken);
  store.delete(AUTH_COOKIE_KEYS.forcePasswordChange);

  if (loginResult.requiresTwoFactor) {
    store.delete(AUTH_COOKIE_KEYS.accessToken);
    store.delete(AUTH_COOKIE_KEYS.refreshToken);
    store.delete(AUTH_COOKIE_KEYS.role);
    store.delete(AUTH_COOKIE_KEYS.rememberMe);
    return;
  }

  if (loginResult.requiresPasswordChange && loginResult.passwordChangeToken) {
    store.set(AUTH_COOKIE_KEYS.forcePasswordChange, "1", {
      ...baseCookieOptions,
      maxAge: 60 * 15,
    });
    store.set(AUTH_COOKIE_KEYS.passwordChangeToken, loginResult.passwordChangeToken, {
      ...baseCookieOptions,
      maxAge: 60 * 15,
    });
    store.delete(AUTH_COOKIE_KEYS.accessToken);
    store.delete(AUTH_COOKIE_KEYS.refreshToken);
    store.delete(AUTH_COOKIE_KEYS.role);
    store.delete(AUTH_COOKIE_KEYS.rememberMe);
    return;
  }

  store.set(AUTH_COOKIE_KEYS.rememberMe, remember ? "1" : "0", {
    ...baseCookieOptions,
    ...persistenceOptions,
  });

  if (loginResult.accessToken) {
    store.set(AUTH_COOKIE_KEYS.accessToken, loginResult.accessToken, {
      ...baseCookieOptions,
      ...persistenceOptions,
    });
  }

  if (loginResult.refreshToken) {
    store.set(AUTH_COOKIE_KEYS.refreshToken, loginResult.refreshToken, {
      ...baseCookieOptions,
      ...persistenceOptions,
    });
  }

  if (loginResult.user?.role) {
    store.set(AUTH_COOKIE_KEYS.role, loginResult.user.role, {
      ...baseCookieOptions,
      ...persistenceOptions,
    });
  }
}

export async function clearAuthCookies() {
  const store = await cookies();
  store.delete(AUTH_COOKIE_KEYS.accessToken);
  store.delete(AUTH_COOKIE_KEYS.refreshToken);
  store.delete(AUTH_COOKIE_KEYS.role);
  store.delete(AUTH_COOKIE_KEYS.rememberMe);
  store.delete(AUTH_COOKIE_KEYS.forcePasswordChange);
  store.delete(AUTH_COOKIE_KEYS.passwordChangeToken);
}

export async function getAccessToken() {
  const store = await cookies();
  const token = store.get(AUTH_COOKIE_KEYS.accessToken)?.value;

  if (!token) {
    return undefined;
  }

  if (isJwtExpired(token)) {
    return undefined;
  }

  return token;
}

export async function getRefreshToken() {
  const store = await cookies();
  const token = store.get(AUTH_COOKIE_KEYS.refreshToken)?.value;

  if (!token) {
    return undefined;
  }

  if (isJwtExpiredStrict(token)) {
    await clearAuthCookies();
    return undefined;
  }

  return token;
}

export async function refreshSessionIfPossible() {
  const store = await cookies();
  const shouldRemember = store.get(AUTH_COOKIE_KEYS.rememberMe)?.value === "1";
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  let refreshRequest = refreshRequests.get(refreshToken);
  if (!refreshRequest) {
    refreshRequest = callApi<LoginResult>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }).then(({ data }) => data);
    refreshRequests.set(refreshToken, refreshRequest);
  }

  try {
    const data = await refreshRequest;

    await setAuthCookies({
      requiresPasswordChange: false,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: data.user,
    }, shouldRemember);

    return data;
  } catch {
    await clearAuthCookies();
    return null;
  } finally {
    if (refreshRequests.get(refreshToken) === refreshRequest) {
      refreshRequests.delete(refreshToken);
    }
  }
}

export function unauthorizedJson(message = "Unauthorized") {
  return NextResponse.json({ message }, { status: 401 });
}
