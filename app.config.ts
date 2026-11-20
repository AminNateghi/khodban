import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "Khodban",
  slug: "khodban",
  scheme: "xyz.nateghi.khodban",
  version: "2.0.1",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  userInterfaceStyle: "automatic",
  platforms: ["android"],
  android: {
    versionCode: 201,
    package: "xyz.nateghi.khodban",
    predictiveBackGestureEnabled: false,
    softwareKeyboardLayoutMode: "resize",
    permissions: ["POST_NOTIFICATIONS", "VIBRATE"],
    blockedPermissions: ["android.permission.SYSTEM_ALERT_WINDOW"],
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        backgroundColor: "#F8FAFC",
        image: "./assets/images/icon-transparency.png",
        dark: {
          image: "./assets/images/icon-transparency.png",
          backgroundColor: "#3a3a3a",
        },
        imageWidth: 200,
      },
    ],
    "expo-sqlite",
    "expo-font",
    "expo-image",
    "expo-status-bar",
    "expo-web-browser",
    "expo-notifications",
    "expo-sharing",
    [
      "expo-file-system",
      {
        supportsOpeningDocumentsInPlace: true,
        enableFileSharing: true,
      },
    ],
    "./plugins/with-android-release-signing",
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
};

export default config;
