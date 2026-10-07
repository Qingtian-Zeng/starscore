import type { CollectionKind } from "./catalog";

export interface CatalogBrowserState {
  query: string;
  category: string;
  favoritesOnly: boolean;
  scrollTop: number;
}

const views = new Map<CollectionKind, CatalogBrowserState>();
export function readCatalogBrowserState(kind: CollectionKind): CatalogBrowserState {
  return { ...(views.get(kind) ?? { query: "", category: "全部", favoritesOnly: false, scrollTop: 0 }) };
}
export function rememberCatalogBrowserState(kind: CollectionKind, state: CatalogBrowserState) {
  views.set(kind, { ...state });
}
