const DEFAULT_BASE_PATH = "/portal";

export const PORTAL_BASE_PATH = process.env.NEXT_PUBLIC_PORTAL_BASE_PATH ?? DEFAULT_BASE_PATH;

const withBasePath = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${PORTAL_BASE_PATH}${normalizedPath}`;
};

export const API_ENDPOINTS = {
  auth: {
    student: withBasePath("/api/auth/student"),
    teacher: withBasePath("/api/auth/teacher"),
    admin: withBasePath("/api/auth/admin"),
    logout: withBasePath("/api/auth/logout"),
  },
  reports: {
    student: withBasePath("/api/reports/student"),
    teacher: withBasePath("/api/reports/teacher"),
  },
  students: {
    list: withBasePath("/api/students"),
    detail: (id: string) => withBasePath(`/api/students/${id}`),
  },
  teachers: {
    list: withBasePath("/api/teachers"),
    detail: (id: string) => withBasePath(`/api/teachers/${id}`),
  },
  subjects: {
    list: withBasePath("/api/subjects"),
    detail: (id: string) => withBasePath(`/api/subjects/${id}`),
  },
  grades: {
    list: withBasePath("/api/grades"),
    detail: (id: string) => withBasePath(`/api/grades/${id}`),
  },
  periods: {
    list: withBasePath("/api/periods"),
    detail: (id: string) => withBasePath(`/api/periods/${id}`),
  },
};

export const fetchJson = async <T,>(url: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "No se pudo completar la solicitud.");
  }

  return data as T;
};
