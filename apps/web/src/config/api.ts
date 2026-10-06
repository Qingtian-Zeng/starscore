const configured = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/$/, "");

export const apiUrl = (path: string) => `${configured ?? ""}${path.startsWith("/") ? path : `/${path}`}`;
export const hasConfiguredApiBase = Boolean(configured);
