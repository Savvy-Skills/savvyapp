// import statusCodes along with GoogleSignin
import {
	GoogleSignin,
	statusCodes,
	isSuccessResponse,
	isErrorWithCode,
	User,
	NativeModuleError,
} from '@react-native-google-signin/google-signin';

// Somewhere in your code
const signIn = async (): Promise<User | NativeModuleError> => {
	try {
		await GoogleSignin.hasPlayServices();
		const response = await GoogleSignin.signIn();
		if (isSuccessResponse(response)) {
			return response.data;
		} else {
			console.log("sign in was cancelled by user");
			return {
				message: "Sign in was cancelled by user",
				code: statusCodes.SIGN_IN_CANCELLED,
				name: "SIGN_IN_CANCELLED",
			} as NativeModuleError;
		}
	} catch (error) {
		if (isErrorWithCode(error)) {
			switch (error.code) {
				case statusCodes.IN_PROGRESS:
					console.error("operation (eg. sign in) already in progress");
					return {
						message: "Operation (eg. sign in) already in progress",
						code: statusCodes.IN_PROGRESS,
						name: "IN_PROGRESS",
					} as NativeModuleError;
				case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
					console.error("Android only, play services not available or outdated");
					return {
						message: "Android only, play services not available or outdated",
						code: statusCodes.PLAY_SERVICES_NOT_AVAILABLE,
						name: "PLAY_SERVICES_NOT_AVAILABLE",
					} as NativeModuleError;
				default:
					console.error("An error that's not related to google sign in occurred", error);
					return error;
			}
		} else {
			console.error("an error that's not related to google sign in occurred", error);
			return {
				message: error,
				name: "UNKNOWN",
			} as NativeModuleError;
		}
	}
};

export { signIn };