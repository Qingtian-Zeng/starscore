import { catalogItems } from "./catalog";

const key="starscore-catalog-favorites-v1";
export function readFavoriteIds():string[] {
  try {
    const value:unknown=JSON.parse(localStorage.getItem(key)??"[]");
    return Array.isArray(value)?[...new Set(value.filter((id):id is string=>typeof id==="string"&&catalogItems.some(item=>item.id===id)))]:[];
  } catch {return []}
}
export function writeFavoriteIds(ids:readonly string[]):boolean {
  try {localStorage.setItem(key,JSON.stringify(ids));return true}catch{return false}
}
