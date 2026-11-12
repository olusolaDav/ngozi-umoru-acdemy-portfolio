export async function postJson<TResponse>(url: string, body: unknown): Promise<TResponse> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const payload = (await response.json().catch(() => ({}))) as {
    message?: string;
    data?: TResponse;
  };

  if (!response.ok) {
    throw new Error(payload.message ?? "Request failed.");
  }

  return (payload.data ?? payload) as TResponse;
}

export async function patchJson<TResponse>(url: string, body: unknown): Promise<TResponse> {
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const payload = (await response.json().catch(() => ({}))) as {
    message?: string;
    data?: TResponse;
  };

  if (!response.ok) {
    throw new Error(payload.message ?? "Request failed.");
  }

  return (payload.data ?? payload) as TResponse;
}

export async function getJson<TResponse>(url: string): Promise<TResponse> {
  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const payload = (await response.json().catch(() => ({}))) as {
    message?: string;
    data?: TResponse;
  };

  if (!response.ok) {
    throw new Error(payload.message ?? "Request failed.");
  }

  return (payload.data ?? payload) as TResponse;
}

export async function deleteJson<TResponse>(url: string): Promise<TResponse> {
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const payload = (await response.json().catch(() => ({}))) as {
    message?: string;
    data?: TResponse;
  };

  if (!response.ok) {
    throw new Error(payload.message ?? "Request failed.");
  }

  return (payload.data ?? payload) as TResponse;
}
