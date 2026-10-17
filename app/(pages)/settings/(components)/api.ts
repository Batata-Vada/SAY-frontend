const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:5001";

export function getHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization:
      typeof window !== "undefined"
        ? localStorage.getItem("token") ?? ""
        : "",
  };
}

export async function apiRequest(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
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