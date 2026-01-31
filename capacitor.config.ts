import "dotenv/config";
import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "io.dabada.app",
  appName: "dabada",
  webDir: "public",
  server: {
    url: "https://dabada.cloudish.cloud",
    cleartext: false,
  },
  allowNavigation: [
    "dabada.cloudish.cloud",
    "accounts.google.com",
    "*.google.com",
    "*.googleusercontent.com",
    "*.gstatic.com",
    "appleid.apple.com",
    "*.apple.com",
  ],
  plugins: {
    App: {
      // 딥링크 URL 스킴 설정
    },
  },
};

export default config;
