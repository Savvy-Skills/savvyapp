import { DatasetInfo } from "@/types";
import { createAPI } from "./apiConfig";

export const datasets_api = createAPI("datasets");

export const getDatasets = async (): Promise<DatasetInfo[]> => {
	try {
		const response = await datasets_api.get<DatasetInfo[]>(`/datasets`);
		return response.data;
	} catch (error) {
		console.error("Error fetching datasets", error);
		return [];
	}
}

export const getWordVecDatasets = async (): Promise<DatasetInfo[]> => {
	try {
		const response = await datasets_api.get<DatasetInfo[]>(`/datasets?word_vec=true`);
		return response.data;
	} catch (error) {
		console.error("Error fetching word vec datasets", error);
		return [];
	}
}