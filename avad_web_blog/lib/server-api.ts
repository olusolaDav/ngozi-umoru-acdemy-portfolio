type ApiEnvelope<T> = {
  success: boolean;
  timestamp: string;
  data: T;
};

type ServerRequestInit = RequestInit & {
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
};

export class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:4000/api/v1";

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export async function callApi<T = unknown>(
  path: string,
  init: ServerRequestInit,
): Promise<{ status: number; data: T }> {
  const requestInit: ServerRequestInit = {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  };

  if (init.next) {
    requestInit.next = init.next;
  } else {
    requestInit.cache = init.cache ?? "no-store";
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestInit,
  });

  const json = (await response.json().catch(() => null)) as
    | ApiEnvelope<T>
    | { message?: string | string[] }
    | null;

  if (!response.ok) {
    const rawMessage = json && "message" in json ? json.message : undefined;
    const message =
      Array.isArray(rawMessage) ? rawMessage.join(", ") : rawMessage ?? "API request failed.";
    throw new ApiRequestError(message, response.status);
  }

  if (!json || typeof json !== "object" || !("data" in json)) {
    throw new Error("Unexpected API response.");
  }

  return {
    status: response.status,
    data: json.data,
  };
}

export function safeErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected error occurred.";
}
