import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";
import axios from "axios";
import { useAuthStore } from "@/store/authStore";

WebBrowser.maybeCompleteAuthSession();

// Replace with your Xano API base URL
const XANO_BASE_URL = "https://api.savvyskills.io/api:dxvrvZMc";

// Replace with your Expo project's scheme
const REDIRECT_URI = AuthSession.makeRedirectUri({
  scheme: "myapp",
});

export const useGoogleAuth = () => {
  const initializeGoogleAuth = async () => {
    try {
      // Step 1: Get the authorization URL from Xano
      const response = await axios.get(
        `${XANO_BASE_URL}/oauth/google/init?redirect_uri=${"https://www.savvyskills.io/login/google-oauth"}`,
        {}
      );

      const authUrl = response.data.authUrl;
      // Step 2: Open the authorization URL in a web browser
      await WebBrowser.openBrowserAsync("http://localhost:8081/login/google-oauth");
    } catch (error) {
      console.error("Google authentication error:", error);
      return { success: false, error: "Authentication failed" };
    }
  };

  return { initializeGoogleAuth };
};
