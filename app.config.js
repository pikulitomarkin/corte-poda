export default {
  expo: {
    name: "Corte de Matos",
    slug: "corte-poda",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "light",
    platforms: ["ios", "android"],
    jsEngine: "hermes",
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      jsEngine: "hermes"
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#ffffff"
      },
      jsEngine: "hermes",
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
        "expo-notifications",
        {
          icon: "./assets/notification-icon.png",
          color: "#ffffff",
          sounds: [
            "notification.wav"
          ]
        }
      ],
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "Este app precisa de acesso à localização para marcar o local dos trabalhos."
        }
      ]
    ]
  }
};
