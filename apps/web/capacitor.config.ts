import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.starscore.app",
  appName: "星谱 StarScore",
  webDir: "dist",
  backgroundColor: "#080D1D",
  server: { androidScheme: "https" },
  android: { backgroundColor: "#080D1D", allowMixedContent: false }
};

export default config;
