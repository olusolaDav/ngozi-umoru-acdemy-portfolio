import { getAccessToken, refreshSessionIfPossible } from "../../auth/_helpers";

export async function getBearerToken() {
  const accessToken = await getAccessToken();
  if (accessToken) {
    return accessToken;
  }

  const refreshed = await refreshSessionIfPossible();
  return refreshed?.accessToken;
}

function isUnauthorizedError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return message.includes("unauthorized") || message.includes("401");
}

export async function withBearerRetry<T>(executor: (token: string) => Promise<T>) {
  const token = await getBearerToken();
  if (!token) {
    throw new Error("Unauthorized");
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
