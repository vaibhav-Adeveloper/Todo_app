const API_BASE_URL = import.meta.env.VITE_API_URL || "/api/v1";

export async function apiRequest(path, { method = "GET", body } = {}) {
  const headers = {};
  let requestBody = body;

  if (body && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    requestBody = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: requestBody,
      credentials: "include",
    });
  } catch (cause) {
    const error = new Error(
      "Cannot reach the backend. Start the server with `npm run dev` in the server folder.",
      { cause },
    );
    error.status = 0;
    throw error;
  }
  const result = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(result?.message || "The request could not be completed");
    error.status = response.status;
    throw error;
  }

  return result?.data;
}
