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

interface GenerateAssessmentsResponse {
  assessments: Assessment[];
}

// API endpoint for generating assessments
const API_URL = 'http://127.0.0.1:5000'; // Change this to your actual API endpoint

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
      buttonLabel: assessment.buttonLabel || "Submit",
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
        buttonLabel: 'Submit',
        subtype: 'Text',
        view_id: 0
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
        buttonLabel: 'Submit',
        subtype: 'Text',
        view_id: 0
      },
      // Add more mock assessment types here
    ]
  };
} 