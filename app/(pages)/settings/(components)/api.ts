/** Shared SAY API client. Authentication uses an HttpOnly cookie, never localStorage. */
export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5001").replace(/\/$/, "");

const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function getHeaders(): HeadersInit {
  return { Accept: "application/json" };
}

export async function apiRequest(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  if (!path.startsWith("/") || path.startsWith("//")) {
    throw new Error("API paths must start with a single slash.");
  }

  const method = (options.method || "GET").toUpperCase();
  const headers = new Headers(options.headers);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  if (
    options.body != null &&
    typeof options.body === "string" &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  try {
    if (UNSAFE_METHODS.has(method)) {
      const csrfResponse = await fetch(`${API_URL}/auth/csrf`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });
      const csrfBody: { csrf_token?: string; message?: string } =
        await csrfResponse.json().catch(() => ({}));
      if (!csrfResponse.ok || !csrfBody.csrf_token) {
        throw new Error(
          csrfBody.message ||
          (csrfResponse.status === 401
            ? "Please sign in with Codeforces again."
            : "Unable to obtain the SAY CSRF token."),
        );
      }
      headers.set("X-SAY-CSRF", csrfBody.csrf_token);
    }

    return await fetch(`${API_URL}${path}`, {
      ...options,
      method,
      headers,
      credentials: "include",
      cache: options.cache || "no-store",
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        `Cannot connect to SAY backend (${API_URL}). Check Flask, the frontend URL and CORS settings.`,
        { cause: error },
      );
    }
    throw error;
  }
}

export async function getErrorMessage(response: Response): Promise<string> {
  const body: { message?: unknown; error?: unknown } =
    await response.json().catch(() => ({}));
  if (typeof body.message === "string") return body.message;
  if (typeof body.error === "string") return body.error;
  return `Request failed (HTTP ${response.status}).`;
}
