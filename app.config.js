export default {
  expo: {
    name: "Corte de Matos",
    slug: "corte-poda",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "light",
    platforms: ["ios", "android"],
    jsEngine: "hermes",
    icon: "./assets/icon.png",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "cover",
      backgroundColor: "#228B22"
    },
    extra: {
      eas: {
        projectId: "a235cc25-bdb0-4ed7-9db8-7a2d55723427"
      }
    },
    updates: {
      url: "https://u.expo.dev/a235cc25-bdb0-4ed7-9db8-7a2d55723427"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      jsEngine: "hermes",
      runtimeVersion: {
        policy: "appVersion"
      }
    },
    android: {
      icon: "./assets/icon.png",
      adaptiveIcon: {
        foregroundImage: "./assets/icon.png",
        backgroundColor: "#2D5016",
        monochromeImage: "./assets/icon.png"
      },
      splash: {
        image: "./assets/splash.png",
        resizeMode: "cover",
        backgroundColor: "#228B22"
      },
      jsEngine: "hermes",
      runtimeVersion: "1.0.0",
      package: "com.pikulito.cortepoda",
      permissions: [
        "CAMERA",
        "WRITE_EXTERNAL_STORAGE",
        "READ_EXTERNAL_STORAGE",
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION"
      ]
    },
    plugins: [
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "Este app precisa de acesso à localização para marcar o local dos trabalhos."
        }
      ]
    ]
  }
};
