import { DatasetInfo, ImageResponse, Metadata, VideoResponse, AudioResponse, FileResponse } from "@/types";
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

export const uploadAudio = async (audio: string): Promise<AudioResponse> => {
	try {
		const response = await media_api.post("/upload/audio", { content: audio });
		return response.data;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export const uploadFile = async (file: string, fileName: string): Promise<FileResponse> => {
	try {
		const response = await media_api.post("/upload/file", { 
			content: file,
			fileName: fileName 
		});
		return response.data;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export const uploadDataset = async (formData: FormData): Promise<DatasetInfo> => {
	try {
		const response = await media_api.post("/upload/dataset", formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});
		return response.data;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

interface BertInferenceResponse {
	score: number;
	token: number;
	token_str: string;
	sequence: string;
}

export const bertInference = async (sentece: string): Promise<BertInferenceResponse[]> => {
	try {
		const response = await media_api.post("/bert", { sentence: sentece });
		return response.data;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export const nextWordPrediction = async (text: string, maxTokens: number): Promise<string> => {
	try {
		const response = await media_api.post("/nextword", { text: text, maxTokens: maxTokens });
		return response.data.generated_text;
	} catch (error) {
		console.error(error);
		throw error;
	}	
};