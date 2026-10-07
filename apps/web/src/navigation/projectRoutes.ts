export type ProjectOrigin = "zodiac" | "materials" | "library" | "community";

export const projectOrigins = {
  zodiac: { label: "十二星座", hash: "#/discover/zodiac", context: "主题创作" },
  materials: { label: "星谱素材", hash: "#/discover/materials", context: "灵感创作" },
  library: { label: "我的星系", hash: "#/library", context: "编辑作品" },
  community: { label: "银河社区", hash: "#/community", context: "星云回应" },
} as const;

export function readProjectRoute(hash: string, page: "studio" | "play") {
  const separator = hash.indexOf("?");
  const path = separator < 0 ? hash : hash.slice(0, separator);
  const query = separator < 0 ? "" : hash.slice(separator + 1);
  const rawId = path.match(new RegExp(`^#/${page}/([^/]+)$`))?.[1];
  let projectId: string | undefined;
  try { projectId = rawId ? decodeURIComponent(rawId) : undefined; } catch { /* Invalid links open the default view. */ }
  const from = new URLSearchParams(query).get("from");
  const origin: ProjectOrigin | undefined = from === "zodiac" || from === "materials" || from === "library" || from === "community" ? from : undefined;
  const sourceGalaxy = new URLSearchParams(query).get("galaxy");
  const galaxyId = origin === "community" && sourceGalaxy && /^[a-zA-Z0-9_-]{1,100}$/.test(sourceGalaxy) ? sourceGalaxy : undefined;
  return { projectId, origin, ...(galaxyId ? {galaxyId} : {}) };
}

export function projectRoute(page: "studio" | "play", projectId: string, origin?: ProjectOrigin, galaxyId?: string) {
  return `#/${page}/${encodeURIComponent(projectId)}${origin ? `?from=${origin}` : ""}${origin === "community" && galaxyId ? `&galaxy=${encodeURIComponent(galaxyId)}` : ""}`;
}
