const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:5001";

const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function getHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
  };
}

export async function apiRequest(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const method = (options.method ?? "GET").toUpperCase();
  const headers = new Headers({
    ...getHeaders(),
    ...options.headers,
  });

  if (UNSAFE_METHODS.has(method)) {
    const csrfResponse = await fetch(`${API_URL}/auth/csrf`, {
      credentials: "include",
      cache: "no-store",
    });
    const csrfData: { csrf_token?: string; message?: string } =
      await csrfResponse.json().catch(() => ({}));

    if (!csrfResponse.ok || !csrfData.csrf_token) {
      throw new Error(csrfData.message ?? "Unable to retrieve CSRF token.");
    }

    headers.set("X-SAY-CSRF", csrfData.csrf_token);
  }

  return fetch(`${API_URL}${path}`, {
    ...options,
    method,
    credentials: "include",
    headers,
  });
}

export async function getErrorMessage(
  response: Response,
): Promise<string> {
  const body = await response.json().catch(() => ({}));

  return (
    body.message ??
    body.error ??
    `Request failed (${response.status})`
  );
}
