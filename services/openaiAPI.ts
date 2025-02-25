import { EmbeddingsResponse } from "@/types/openai";
import { createAPI } from "./apiConfig";
import { AxiosResponse } from "axios";

export const openai_api = createAPI("openai");


export const getEmbeddings = async (text: string): Promise<EmbeddingsResponse> => {
	const response: AxiosResponse<EmbeddingsResponse> = await openai_api.get("/embeddings", {
		params: {
			word: text,
			model: "text-embedding-3-small"
		}
	});
	return response.data;
}


openai_api.interceptors.request.use(
	(config) => {
		config.headers["Content-Type"] = "multipart/form-data";
		return config;
	},
	(error) => {
		// Do something with request error
		console.error("Request error", error);
		return Promise.reject(error);
	}
);
