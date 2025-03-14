import { ImageResponse } from "@/types";
import { createAPI } from "./apiConfig";

const api = createAPI("media");

export const uploadImage = async (image: string): Promise<ImageResponse> => {
	try {
		const response = await api.post("/upload/image", { content: image });
		return response.data;
	} catch (error) {
		console.error(error);
		throw error;
	}
};
