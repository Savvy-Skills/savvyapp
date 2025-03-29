import axios from 'axios';
import { Assessment } from '@/types/index';

// Define the request and response types
interface GenerateAssessmentsRequest {
	content_topic: string;
	description?: string;
	concepts?: string[];
	grade_level?: string;
	tone?: string;
}

interface AssessmentResponse extends Assessment {
	slideName: string;
}

interface GenerateAssessmentsResponse {
	assessments: AssessmentResponse[];
}

// API endpoint for generating assessments
const API_URL = 'https://asssesmentsagent-production.up.railway.app'; // Change this to your actual API endpoint

/**
 * Generate assessments using AI
 */
export async function generateAssessments(
	requestData: GenerateAssessmentsRequest
): Promise<GenerateAssessmentsResponse> {
	try {
		const response = await axios.post<GenerateAssessmentsResponse>(
			`${API_URL}/generate-assessments`,
			requestData
		);

		// Add some default fields that might be needed but not provided by the AI
		const processedAssessments = response.data.assessments.map(assessment => ({
			...assessment,
			slideName: assessment.slideName || assessment.text.substring(0, 30), // Use first 30 chars of text as slideName if not provided
			subtype: assessment.subtype || "Text",
		}));

		return {
			assessments: processedAssessments
		};
	} catch (error) {
		console.error('Error generating assessments:', error);
		throw error;
	}
}

// For testing/development, you can add a mock function
export async function mockGenerateAssessments(
	requestData: GenerateAssessmentsRequest
): Promise<GenerateAssessmentsResponse> {
	// Simulate API delay
	await new Promise(resolve => setTimeout(resolve, 3000));

	// Return mock data
	return {
		assessments: [
			{
				type: 'Single Choice',
				text: `What is the main process that occurs during ${requestData.content_topic}?`,
				slideName: `${requestData.content_topic} Process`,
				options: [
					{ text: 'Correct answer', isCorrect: true, correctOrder: 0, match: '' },
					{ text: 'Incorrect answer 1', isCorrect: false, correctOrder: 0, match: '' },
					{ text: 'Incorrect answer 2', isCorrect: false, correctOrder: 0, match: '' },
					{ text: 'Incorrect answer 3', isCorrect: false, correctOrder: 0, match: '' },
				],
				explanation: 'This is the explanation for the correct answer.',
				subtype: 'Text',
				title: 'Main Process',
			},
			{
				type: 'Multiple Choice',
				text: `Select all factors that contribute to ${requestData.content_topic}:`,
				slideName: `${requestData.content_topic} Factors`,
				options: [
					{ text: 'Correct factor 1', isCorrect: true, correctOrder: 0, match: '' },
					{ text: 'Correct factor 2', isCorrect: true, correctOrder: 0, match: '' },
					{ text: 'Incorrect factor', isCorrect: false, correctOrder: 0, match: '' },
					{ text: 'Incorrect factor', isCorrect: false, correctOrder: 0, match: '' },
				],
				subtype: 'Text',
				title: 'Factors',
			},
			// Add more mock assessment types here
		]
	};
}

// //  // Get the assessment to improve
// const assessmentToImprove = generatedAssessments[currentAssessmentIndex];

// // Prepare request data
// const requestData = {
// 	assessment: assessmentToImprove,
// 	instructions: instructions,
// 	content_topic: currentFormData.content_topic,
// 	description: currentFormData.description,
// 	concepts: currentFormData.concepts,
// 	grade_level: currentFormData.grade_level,
// 	tone: currentFormData.tone
// };

// // Make API request to improve assessment
// fetch('http://127.0.0.1:5000/improve-assessment', {
// 	method: 'POST',
// 	headers: {
// 		'Content-Type': 'application/json'
// 	},
// 	body: JSON.stringify(requestData)
// // })


interface ImproveAssessmentRequest {
	assessment: Assessment;
	instructions: string;
	content_topic: string;
	description: string;
	concepts: string[];
	grade_level: string;
	tone: string;
}

interface ImproveAssessmentResponse {
	improved_assessment: Assessment;
}

/**
 * Improve specific assessment
 */
export async function improveAssessment(
	requestData: ImproveAssessmentRequest
): Promise<ImproveAssessmentResponse> {
	try {
		const response = await axios.post<ImproveAssessmentResponse>(
			`${API_URL}/improve-assessment`,
			requestData
		);

		// Make sure we have all the expected fields
		const improvedAssessment = {
			...response.data.improved_assessment,
			slideName: response.data.improved_assessment.slideName || 
				response.data.improved_assessment.text.substring(0, 30),
			subtype: response.data.improved_assessment.subtype || "Text",
		};

		return {
			improved_assessment: improvedAssessment
		};
	} catch (error) {
		console.error('Error improving assessment:', error);
		throw error;
	}
}

// Optional: Add a mock version for testing
export async function mockImproveAssessment(
	requestData: ImproveAssessmentRequest
): Promise<ImproveAssessmentResponse> {
	// Simulate API delay
	await new Promise(resolve => setTimeout(resolve, 2000));
	
	// Create an improved version based on the original assessment
	const original = requestData.assessment;
	
	// This is a simple example - the AI would actually make more intelligent changes
	const improved: Assessment = {
		...original,
		text: original.text + " (Improved)",
		explanation: original.explanation ? 
			original.explanation + " Additional explanation based on your instructions: " + requestData.instructions : 
			"Explanation added per your request: " + requestData.instructions,
		options: original.options?.map(option => ({
			...option,
			text: option.isCorrect ? 
				option.text + " (enhanced correct answer)" : 
				option.text + " (enhanced distractor)"
		})) || []
	};
	
	return {
		improved_assessment: improved
	};
}