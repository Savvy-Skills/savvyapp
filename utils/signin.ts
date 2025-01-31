// import statusCodes along with GoogleSignin
import {
	GoogleSignin,
	statusCodes,
	isSuccessResponse,
	isErrorWithCode,
} from '@react-native-google-signin/google-signin';

// Somewhere in your code
const signIn = async () => {
	try {
		await GoogleSignin.hasPlayServices();
		const response = await GoogleSignin.signIn();
		if (isSuccessResponse(response)) {
			return response.data;
		} else {
			console.log("sign in was cancelled by user");
			return null;
		}
	} catch (error) {
		if (isErrorWithCode(error)) {
			switch (error.code) {
				case statusCodes.IN_PROGRESS:
					console.error("operation (eg. sign in) already in progress");
					return null;
				case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
					console.error("Android only, play services not available or outdated");
					return null;
				default:
					console.error("An error that's not related to google sign in occurred", error);
					return null;
			}
		} else {
			console.error("an error that's not related to google sign in occurred", error);
			return null;
		}
	}
};

export { signIn };