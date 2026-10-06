import { Capacitor } from "@capacitor/core";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

export const isNativeApp = () => Capacitor.isNativePlatform();

function toBase64(data: string | ArrayBuffer | Uint8Array) {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data instanceof Uint8Array ? data : new Uint8Array(data);
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 0x8000) binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  return btoa(binary);
}

export async function shareProjectFile(data: string | ArrayBuffer | Uint8Array, filename: string, dialogTitle: string) {
  const saved = await Filesystem.writeFile({ path: filename, data: toBase64(data), directory: Directory.Cache, recursive: true });
  await Share.share({ title: dialogTitle, text: "由星谱 StarScore 导出", url: saved.uri, dialogTitle });
}
