import { getAccessToken, refreshSessionIfPossible } from "../auth/_helpers";

function isUnauthorizedError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return message.includes("unauthorized") || message.includes("401");
}

export async function withBearerRetry<T>(executor: (token: string) => Promise<T>) {
  let token = await getAccessToken();

  // An expired access token is intentionally not returned by getAccessToken().
  // Try the refresh token before rejecting the request, including when the
  // first API call is a DELETE and there is no response to trigger a retry.
  if (!token) {
    const refreshed = await refreshSessionIfPossible();
    token = refreshed?.accessToken;
    if (!token) {
      throw new Error("Unauthorized");
    }
  }

  try {
    return await executor(token);
  } catch (error) {
    if (!isUnauthorizedError(error)) {
      throw error;
    }

    const refreshed = await refreshSessionIfPossible();
    if (!refreshed?.accessToken) {
      throw error;
    }

    return executor(refreshed.accessToken);
  }
}
