export default {
  name: "Afta Delivery",
  slug: "afta-delivery",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  updates: {
    fallbackToCacheTimeout: 0
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#FFFFFF"
    },
    package: "et.afta.delivery"
  },
  web: {
    favicon: "./assets/favicon.png"
  },
  extra: {
    backendUrl: "http://10.0.2.2:5000" // Android emulator localhost
  }
};


