import { LoginResponse, User } from "@/types";
import { createAPI } from "./apiConfig";

export const authAPI = createAPI("auth");
export const oauthAPI = createAPI("oauth");

export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  try {
    const data = { email, password };
    const response = await authAPI.post<LoginResponse>(
      "/auth/login/password",
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error at login", error);
    // return {} as LoginResponse;
	throw error;
  }
};
// TODO: change check if we are in dev
const redirectUri = process.env.NODE_ENV === "development" ? "http://localhost:8081/auth/callback" : "https://savvyskills.io/auth/callback";

interface GoogleContinueResponse {
	accessToken: string;
	token: string;
	name: string;
	email: string;
}

export const googleContinue = async ({code, idToken}: {code?: string, idToken?: string}): Promise<GoogleContinueResponse> => {
	try {
		let url = ``;
		if (code) {
			url = `/oauth/google/continue?code=${code}&redirect_uri=${redirectUri}`;
		} else if (idToken) {
			url = `/oauth/google/continue?oauth_token=${idToken}&redirect_uri=${redirectUri}`;
		}
		const response = await oauthAPI.get(url);
		return response.data;
	} catch (error) {
		console.error("Error at googleContinue", error);
		return {} as GoogleContinueResponse;
	}
}

export const getGoogleInitUrl = async (): Promise<string> => {
	try {
		const url = "/oauth/google/init"+"?redirect_uri="+redirectUri;	
		const response = await oauthAPI.get(url);
		return response.data.authUrl;
	} catch (error) {
		console.error("Error at getGoogleInitUrl", error);
		return "";
	}
};

export const authme = async (token: string): Promise<User> => {
  try {
	authAPI.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    const response = await authAPI.get<User>("/auth/me");
    return response.data;
  } catch (error) {
    console.error("Error at authme", error);
    return {} as User;
  }
};
