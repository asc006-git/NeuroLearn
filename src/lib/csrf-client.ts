let cachedToken = "";

export async function getCsrfToken(): Promise<string> {
  if (cachedToken) return cachedToken;
  const res = await fetch("/api/csrf");
  const data = await res.json();
  cachedToken = data.csrfToken || "";
  return cachedToken;
}

export async function fetchWithCsrf(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getCsrfToken();
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      "Content-Type": "application/json",
      "x-csrf-token": token,
    },
  });
}
