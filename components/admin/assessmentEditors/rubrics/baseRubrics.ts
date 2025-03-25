import { Rubric } from '@/types';

interface BaseRubric {
	id: string;
	name: string;
	rubric: Rubric[];
}

const baseRubrics: BaseRubric[] = [
	{
		id: '1',
		name: ' General Understanding and Communication',
		rubric: [
			{
				"criterion": "Understanding of Concepts",
				"levels": [
					{
						"name": "Excellent",
						"description": "Demonstrates a thorough and accurate understanding of the key concepts.",
						"value": 3
					},
					{
						"name": "Good",
						"description": "Demonstrates a good understanding of the key concepts with minor inaccuracies.",
						"value": 2
					},
					{
						"name": "Needs Improvement",
						"description": "Demonstrates a limited understanding of the key concepts or has significant inaccuracies.",
						"value": 1
					}
				]
			},
			{
				"criterion": "Clarity of Communication",
				"levels": [
					{
						"name": "Excellent",
						"description": "Ideas are communicated clearly, logically, and effectively using appropriate language.",
						"value": 3
					},
					{
						"name": "Good",
						"description": "Ideas are generally communicated clearly and logically with minor issues in language or organization.",
						"value": 2
					},
					{
						"name": "Needs Improvement",
						"description": "Ideas are often unclear, disorganized, or difficult to understand. Language may be inappropriate.",
						"value": 1
					}
				]
			},
			{
				"criterion": "Use of Evidence or Examples",
				"levels": [
					{
						"name": "Excellent",
						"description": "Effectively uses relevant and specific evidence or examples to support understanding.",
						"value": 3
					},
					{
						"name": "Good",
						"description": "Uses some relevant evidence or examples to support understanding.",
						"value": 2
					},
					{
						"name": "Needs Improvement",
						"description": "Provides little to no relevant evidence or examples, or the evidence does not support understanding.",
						"value": 1
					}
				]
			}
		],
	},
	{
		id: '2',
		name: 'Problem Solving and Reasoning',
		rubric: [
			{
				"criterion": "Problem Identification & Approach",
				"levels": [
					{
						"name": "Excellent",
						"description": "Clearly identifies the problem and demonstrates a thoughtful and effective approach to solving it.",
						"value": 3
					},
					{
						"name": "Good",
						"description": "Identifies the problem and demonstrates a generally sound approach to solving it.",
						"value": 2
					},
					{
						"name": "Needs Improvement",
						"description": "Struggles to clearly identify the problem or demonstrates an ineffective or unclear approach.",
						"value": 1
					}
				]
			},
			{
				"criterion": "Reasoning & Justification",
				"levels": [
					{
						"name": "Excellent",
						"description": "Provides clear, logical reasoning and thoroughly justifies all steps and conclusions.",
						"value": 3
					},
					{
						"name": "Good",
						"description": "Provides generally logical reasoning and justifies most steps and conclusions.",
						"value": 2
					},
					{
						"name": "Needs Improvement",
						"description": "Reasoning is unclear or illogical, and justification for steps or conclusions is weak or missing.",
						"value": 1
					}
				]
			},
			{
				"criterion": "Accuracy of Solution or Outcome",
				"levels": [
					{
						"name": "Excellent",
						"description": "The solution or outcome is accurate and effectively addresses the problem.",
						"value": 3
					},
					{
						"name": "Good",
						"description": "The solution or outcome is mostly accurate with minor errors or omissions.",
						"value": 2
					},
					{
						"name": "Needs Improvement",
						"description": "The solution or outcome is inaccurate or does not effectively address the problem.",
						"value": 1
					}
				]
			}
		]
	},
	{
		id: '3',
		name: 'Creativity and Effort',
		rubric: [
			{
				"criterion": "Originality & Creativity",
				"levels": [
					{
						"name": "Excellent",
						"description": "Demonstrates a high degree of originality, creativity, and unique thinking in the response.",
						"value": 3
					},
					{
						"name": "Good",
						"description": "Shows some originality and creativity in the response.",
						"value": 2
					},
					{
						"name": "Needs Improvement",
						"description": "Demonstrates little originality or creativity; the response may be uninspired or copied.",
						"value": 1
					}
				]
			},
			{
				"criterion": "Effort & Completion",
				"levels": [
					{
						"name": "Excellent",
						"description": "Demonstrates significant effort and the response is thorough and complete, addressing all aspects of the prompt.",
						"value": 3
					},
					{
						"name": "Good",
						"description": "Demonstrates reasonable effort and the response is mostly complete, addressing the main aspects of the prompt.",
						"value": 2
					},
					{
						"name": "Needs Improvement",
						"description": "Demonstrates minimal effort, and the response is incomplete or does not adequately address the prompt.",
						"value": 1
					}
				]
			},
			{
				"criterion": "Presentation & Organization",
				"levels": [
					{
						"name": "Excellent",
						"description": "The work is presented in a clear, organized, and visually appealing manner that enhances understanding.",
						"value": 3
					},
					{
						"name": "Good",
						"description": "The work is generally well-organized and easy to follow with minor issues in presentation.",
						"value": 2
					},
					{
						"name": "Needs Improvement",
						"description": "The work is disorganized, difficult to follow, or poorly presented, hindering understanding.",
						"value": 1
					}
				]
			}
		]
	}
];

export default baseRubrics; 