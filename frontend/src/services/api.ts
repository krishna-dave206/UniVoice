const BASE_URL = "http://localhost:3000";

function getToken(): string | null {
  return localStorage.getItem("token");
}

function authHeaders(): HeadersInit {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<{ success: boolean; data?: T; message?: string }> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: authHeaders(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const json = await res.json();
    return json;
  } catch {
    return { success: false, message: "Network error — is the backend running?" };
  }
}

export function normaliseDoc<T extends Record<string, any>>(
  doc: T,
  idAlias: string
): T {
  if (!doc) return doc;
  return { ...doc, [idAlias]: doc._id ?? doc[idAlias] ?? "" };
}

export const authApi = {
  login: (email: string, password: string) =>
    request<{ user: unknown; token: string }>("POST", "/api/auth/login", {
      email,
      password,
    }),

  register: (body: unknown) =>
    request<{ user: unknown; token: string }>("POST", "/api/auth/register", body),

  me: () => request<unknown>("GET", "/api/auth/me"),
};

export const postsApi = {
  getAll: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<unknown[]>("GET", `/api/posts${qs}`);
  },
  getById: (id: string) => request<unknown>("GET", `/api/posts/${id}`),
  create: (body: unknown) => request<unknown>("POST", "/api/posts", body),
  update: (id: string, body: unknown) =>
    request<unknown>("PATCH", `/api/posts/${id}`, body),
  changeStatus: (id: string, status: string) =>
    request<unknown>("PATCH", `/api/posts/${id}/status`, { status }),
  upvote: (id: string, userId?: string) =>
    request<unknown>("POST", `/api/posts/${id}/upvote`, { userId }),
  downvote: (id: string, userId?: string) =>
    request<unknown>("POST", `/api/posts/${id}/downvote`, { userId }),
  delete: (id: string, userId?: string) =>
    request<unknown>("DELETE", `/api/posts/${id}`, { userId }),
};

export const commentsApi = {
  getByPost: (postId: string) =>
    request<unknown[]>("GET", `/api/comments/${postId}`),
  add: (body: unknown) => request<unknown>("POST", "/api/comments", body),
  edit: (id: string, body: string, userId: string) =>
    request<unknown>("PATCH", `/api/comments/${id}`, { body, userId }),
  delete: (id: string, userId: string) =>
    request<unknown>("DELETE", `/api/comments/${id}`, { userId }),
};

export const announcementsApi = {
  getAll: () => request<unknown[]>("GET", "/api/announcements"),
};

export const adminApi = {
  getStats: () => request<unknown>("GET", "/api/admin/stats"),
  getPosts: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<unknown[]>("GET", `/api/admin/posts${qs}`);
  },
  changeStatus: (postId: string, status: string, adminId: string) =>
    request<unknown>("PATCH", `/api/admin/${postId}/status`, {
      status,
      adminId,
    }),
  assign: (postId: string, staffId: string, adminId: string) =>
    request<unknown>("PATCH", `/api/admin/${postId}/assign`, {
      staffId,
      adminId,
    }),
  delete: (postId: string, adminId: string) =>
    request<unknown>("DELETE", `/api/admin/${postId}`, { adminId }),
};
