import { ImageResponse, VideoResponse } from "@/types";
import { createAPI } from "./apiConfig";

export const media_api = createAPI("media");


export const uploadImage = async (image: string): Promise<ImageResponse> => {
	try {
		const response = await media_api.post("/upload/image", { content: image });
		return response.data;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export const uploadVideo = async (video: string): Promise<VideoResponse> => {
	try {
		const response = await media_api.post("/upload/video", { content: video });
		return response.data;
	} catch (error) {
		console.error(error);
		throw error;
	}
};
