module.exports = {
  name: "Corte de Matos",
  slug: "corte-poda",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  assetBundlePatterns: [
    "**/*"
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.managematos.cortepoda"
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff"
    },
    package: "com.managematos.cortepoda",
    versionCode: 1,
    buildToolsVersion: "33.0.0",
    compileSdkVersion: 33,
    targetSdkVersion: 33,
    config: {
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_API_KEY || ""
      }
    }
  },
  web: {
    favicon: "./assets/favicon.png"
  },
  extra: {
    eas: {
      projectId: process.env.EAS_PROJECT_ID || ""
    }
  },
  plugins: [
    [
      "expo-build-properties",
      {
        android: {
          enableProguardInReleaseBuilds: true,
          enableDexGuardInReleaseBuilds: false,
          extraProguardRules: "-keep class com.managematos.cortepoda.** { *; }"
        }
      }
    ]
  ],
  updates: {
    fallbackToCacheTimeout: 0
  }
};
