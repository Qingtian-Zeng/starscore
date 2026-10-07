import { readFile } from "node:fs/promises";

const expected = {
  theme: "navy",
  accent: "#65e6e2",
  response: "#bfa2f6",
  canvasHeight: 560,
  starSize: 1,
  radius: 28,
  linkOpacity: 0.42,
  showPitch: false,
  showBackground: true,
  showHints: true,
  showNoteList: true,
  showInspector: true,
  showTracks: true,
  showResponses: true,
  viewport: "phone"
};

const config = JSON.parse(await readFile(new URL("../docs/CONFIRMED_INTERFACE_20261007.json", import.meta.url), "utf8"));
for (const [key, value] of Object.entries(expected)) {
  if (config.appearance?.[key] !== value) throw new Error(`confirmed appearance mismatch: ${key}`);
}

const [tokens, styles, builder, shell] = await Promise.all([
  readFile(new URL("../apps/web/src/styles/tokens.css", import.meta.url), "utf8"),
  readFile(new URL("../apps/web/src/styles/global.css", import.meta.url), "utf8"),
  readFile(new URL("./build-standalone.mjs", import.meta.url), "utf8"),
  readFile(new URL("./standalone-shell.html", import.meta.url), "utf8")
]);
if (!tokens.includes("--response: #bfa2f6")) throw new Error("response token is not baked into the App");
if (!styles.includes('.preview-pitch-label{display:none}')) throw new Error("pitch labels are not hidden by default");
if (!styles.includes('html[data-show-pitch="true"] .preview-pitch-label{display:block}')) throw new Error("preview pitch toggle is unavailable");
if (!builder.includes("viewport:'phone'") || !shell.includes("viewport:'phone'")) throw new Error("phone preview is not the default");
console.log("PASS: confirmed 2026-10-07 interface values are baked into the App and standalone preview.");
