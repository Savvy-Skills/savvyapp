export interface EmbeddingsResponse {
	object: string
	data: Daum[]
	model: string
	usage: Usage
}

export interface Daum {
	object: string
	embedding: number[]
	index: number
}

export interface Usage {
	prompt_tokens: number
	total_tokens: number
}