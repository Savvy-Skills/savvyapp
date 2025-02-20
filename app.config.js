const IS_DEV = process.env.APP_VARIANT === "development";
const IS_PREVIEW = process.env.APP_VARIANT === "preview";

const getUniqueIdentifier = () => {
  if (IS_DEV) {
    return "com.SavvySkills.dev";
  }

  if (IS_PREVIEW) {
    return "com.SavvySkills.preview";
  }

  return "com.SavvySkills";
};

const getAppName = () => {
  if (IS_DEV) {
    return "SavvySkills (Dev)";
  }

  if (IS_PREVIEW) {
    return "SavvySkills (Preview)";
  }

  return "SavvySkills: Build the future";
};

export default {
  name: getAppName(),
  slug: "savvy-skills",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/pngs/icon.png",
  scheme: "myapp",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/images/pngs/splash.png",
    resizeMode: "cover",
    backgroundColor: "#ffffff",
  },
  ios: {
    supportsTablet: true,
    bundlerIdentifier: getUniqueIdentifier(),
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/pngs/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    package: getUniqueIdentifier(),
    permissions: [
      "android.permission.CAMERA",
      "android.permission.RECORD_AUDIO",
    ],
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/pngs/icon.png",
  },
  plugins: [
    "expo-router",
    [
      "@react-native-google-signin/google-signin",
      {
        iosUrlScheme:
          "com.googleusercontent.apps.175190225211-bcbvqfu9e9ltvbdnaevrvr9dk731sop6",
      },
    ],
    [
      "expo-camera",
      {
        cameraPermission: "Allow SavvySkills to access your camera",
        microphonePermission: "Allow SavvySkills to access your microphone",
        recordAudioAndroid: true,
      },
    ],
   ["expo-build-properties"],
    [
      "expo-font",
      {
        fonts: [
          "./assets/fonts/PoppinsRegular.ttf",
          "./assets/fonts/PoppinsBold.ttf",
          "./assets/fonts/PoppinsSemiBold.ttf",
          "./assets/fonts/PoppinsBlack.ttf",
          "./assets/fonts/PoppinsExtraBold.ttf",
        ],
      },
    ],
    [
      "expo-video",
      {
        supportsBackgroundPlayback: true,
        supportsPictureInPicture: true,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },

  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: "f0200142-2e46-4d8c-8d01-2759418c00e3",
    },
  },
  owner: "savvyskills",
  updates: {
    url: "https://u.expo.dev/f0200142-2e46-4d8c-8d01-2759418c00e3",
  },
  runtimeVersion: {
    policy: "appVersion",
  },
};
