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
  slug: "savvyskills",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "myapp",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/images/pngs/savvysplash.png",
    resizeMode: "cover",
    backgroundColor: "#ffffff",
  },
  ios: {
    supportsTablet: true,
    bundlerIdentifier: getUniqueIdentifier(),
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
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
    favicon: "./assets/images/pngs/savvylogo.png",
  },
  plugins: [
    "expo-router",
    "@react-native-google-signin/google-signin",
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
      projectId: "c7584a9c-5ef8-4cae-96b8-00bd1bcc4dc7",
    },
  },
  owner: "samuel-savvy",
  updates: {
    url: "https://u.expo.dev/c7584a9c-5ef8-4cae-96b8-00bd1bcc4dc7",
  },
  runtimeVersion: {
    policy: "appVersion",
  },
};
