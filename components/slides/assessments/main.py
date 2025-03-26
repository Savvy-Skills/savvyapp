from flask import Flask, jsonify, Response, stream_with_context, request
import os
import asyncio
import queue
import threading
import json
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from agents import Agent, Runner, function_tool, FileSearchTool, GuardrailFunctionOutput, InputGuardrailTripwireTriggered, RunContextWrapper, input_guardrail
from flask_cors import CORS
from openai import OpenAI

app = Flask(__name__)
# Enable CORS for all routes
CORS(app)

# Initialize OpenAI client
client = OpenAI()

# Define models for criteria evaluation
class CriterionLevel(BaseModel):
    name: str = Field(description="Name of the level (e.g., 'Excellent', 'Good', 'Needs Improvement')")
    value: int = Field(description="Numeric value of this level for scoring")
    description: str = Field(description="Description of what this level means")
    quote: str = Field(description="Quote from the answer that supports this level")

class Criterion(BaseModel):
    criterion: str = Field(description="The name of the criterion")
    levels: List[CriterionLevel] = Field(description="Possible levels for this criterion")

# class CriterionEvaluation(BaseModel):
#     result_rubrics: List[Criterion] = Field(description="Criterions and levels the answer reached")

# Define output structure for our answer evaluator
class AnswerEvaluation(BaseModel):
    feedback: str = Field(description="Constructive feedback for the student")
    is_correct: bool = Field(description="Whether the answer is considered correct (rating >= 50% of max score)")
    rubrics: List[Criterion] = Field(description="Evaluation of each criterion in the rubrics")

# Define output structures for our guardrails
class ModerationCheckOutput(BaseModel):
    reasoning: str = Field(description="Explanation of the moderation result")
    contains_prohibited_content: bool = Field(description="Whether the input contains prohibited content")
    flagged_categories: Dict[str, float] = Field(description="Categories that were flagged with their scores", default_factory=dict)

class RelevanceCheckOutput(BaseModel):
    reasoning: str = Field(description="Reasoning about whether the answer is relevant to the question")
    is_relevant: bool = Field(description="Whether the answer is relevant to the question")

# Create relevance check agent
relevance_check_agent = Agent(
    name="RelevanceChecker",
    instructions="""
    Your task is to determine if a student's answer is relevant to the question being asked.
    
    Follow these guidelines:
    1. Extract the topic and key concepts from the question
    2. Analyze the answer to see if it addresses the topic
    3. Answer might be short or incomplete, but still relevant if it attempts to address or answer the question
    4. An answer is irrelevant if it discusses completely unrelated topics
    5. An answer is irrelevant if it is a question
    6. An answer is irrelevant if its gibberish or nonsensical words
    
    Respond with whether the answer is relevant to the question and your reasoning.
    """,
    output_type=RelevanceCheckOutput,
    model="gpt-4o-mini"
)

@input_guardrail
async def profanity_guardrail(
    context: RunContextWrapper[None], agent: Agent, input: str
) -> GuardrailFunctionOutput:
    # Remove rubrics from input text
    input = remove_rubrics_from_input(input)
    
    # Use OpenAI's moderation API
    response = client.moderations.create(
        model="omni-moderation-latest",
        input=input
    )
    # Save the response to a file
    with open("moderation_result.json", "w") as f:
        json.dump(response.model_dump(), f)
    
    # Check if the content is flagged
    is_flagged = response.results[0].flagged
    # Create a meaningful reasoning message with flagged categories
    reasoning = "Content passed moderation check."
    flagged_categories = {}
    
    if is_flagged:
        # Get the categories that were flagged and their scores
        categories = response.results[0].categories
        category_scores = response.results[0].category_scores
        
        # Build the flagged categories dictionary with scores
        for category_name, is_flagged_category in categories.model_dump().items():
            if is_flagged_category:  # Changed variable name to avoid shadowing
                flagged_categories[category_name] = category_scores.model_dump().get(category_name, 0.0)
        
        # Create reasoning message
        category_list = ", ".join(flagged_categories.keys())
        reasoning = f"Content was flagged in the following categories: {category_list}"
    
    # Create output
    output_info = ModerationCheckOutput(
        reasoning=reasoning,
        contains_prohibited_content=is_flagged,
        flagged_categories=flagged_categories
    )
    
    
    return GuardrailFunctionOutput(
        output_info=output_info,
        tripwire_triggered=is_flagged,
    )
    
@input_guardrail
async def relevance_guardrail(
    context: RunContextWrapper[None], agent: Agent, input: str
) -> GuardrailFunctionOutput:
    # Remove rubrics from input text
    input = remove_rubrics_from_input(input)
    
    result = await Runner.run(relevance_check_agent, input, context=context.context)
    
    return GuardrailFunctionOutput(
        output_info=result.final_output_as(RelevanceCheckOutput),
        tripwire_triggered=not result.final_output_as(RelevanceCheckOutput).is_relevant,
    )
    
# Create our answer evaluator agent with guardrails
answer_evaluator = Agent(
    name="AnswerEvaluator",
    instructions="""
    You are an expert educational answer evaluator. Your task is to evaluate student answers to programming and technical questions based on provided rubrics.
    
    Follow these guidelines:
    1. Carefully read the question and the student's answer
    2. Check if rubrics are provided in the input. If not, use the FileSearchTool to search for "rubrics.json" to retrieve the default rubrics
    3. Evaluate the answer against each criterion in the rubrics
       - For each criterion, determine which level the answer achieves
       - Include the criterion name, achieved level name, and the corresponding value in your evaluation
       - Include a quote of the answer where the specific criterion was judged.
    4. Provide concise, constructive feedback that helps the student learn (keep the feedback about 2-3 paragraphs and 20-80 words maximum)
    5. Be fair and consistent in your evaluations
    
    Your evaluation should be thorough but concise. Do not include detailed reasoning in your output, as the rubrics evaluation will show how the score was calculated.
    """,
    output_type=AnswerEvaluation,
    tools=[
        FileSearchTool(
            max_num_results=3,
            vector_store_ids=["vs_67dba80cc2908191af160cd8d659db98"],
            include_search_results=True,
        )
    ],
    input_guardrails=[profanity_guardrail, relevance_guardrail]
)

# Load default rubrics from file
def load_default_rubrics():
    try:
        with open(os.path.join(os.path.dirname(__file__), 'rubrics.json'), 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading default rubrics: {e}")
        return []

# Default rubrics
DEFAULT_RUBRICS = load_default_rubrics()

def get_max_score(rubrics):
    # Get max values of each criterion, max values are not always in the first position
    # Flat criterion levels, get max value for each criterion, sum all
    max_score = 0
    
    # Check if rubrics is a list of dictionaries or a list of Criterion objects
    if rubrics and isinstance(rubrics[0], dict):
        # Handle dictionary format (from JSON)
        for criterion in rubrics:
            max_score += max(criterion['levels'], key=lambda x: x['value'])['value']
    else:
        # Handle Criterion objects
        for criterion in rubrics:
            max_score += max(criterion.levels, key=lambda x: x.value).value
            
    return max_score

def remove_rubrics_from_input(input_text):
    """
    Removes the rubrics section from the input text.
    This is used for guardrails to ensure they only check the question and answer content.
    
    Args:
        input_text (str): The full input text including question, answer, and rubrics
        
    Returns:
        str: The input text with the rubrics section removed
    """
    # Find the index where the rubrics section begins
    rubrics_index = input_text.find("\n\nRubrics:")
    
    if rubrics_index != -1:
        # Return only the question and answer parts
        return input_text[:rubrics_index]
    
    # If no rubrics section is found, return the original input
    return input_text

@app.route('/')
def index():
    return jsonify({"status": "E-Learning Answer Evaluator API is running"})

@app.route('/rubrics', methods=['GET'])
def get_default_rubrics():
    """Return the default rubrics from the rubrics.json file"""
    return jsonify(DEFAULT_RUBRICS)

@app.route('/evaluate', methods=['POST'])
def evaluate_answer():
    data = request.json
    question = data.get('question', '')
    answer = data.get('answer', '')
    rubrics = data.get('rubrics')
    
    if not question or not answer:
        return jsonify({"error": "Both question and answer are required"}), 400
    
    # Format the input based on whether rubrics are provided
    if rubrics:
        user_input = f"Question: {question}\n\nStudent Answer: {answer}\n\nRubrics: {json.dumps(rubrics)}"
        # Get max score from rubrics
        max_score = get_max_score(rubrics)
    else:
        user_input = f"Question: {question}\n\nStudent Answer: {answer}"
        # Use default rubrics for max score calculation
        max_score = get_max_score(DEFAULT_RUBRICS)
    
    try:
        # Use asyncio.run to execute the async function from synchronous code
        result = asyncio.run(Runner.run(answer_evaluator, user_input))
        evaluation = result.final_output

        # Calculate rating from rubrics
        rating = sum([criterion.levels[0].value for criterion in evaluation.rubrics])
        
        return jsonify({
            "rating": rating,
            "feedback": evaluation.feedback,
            "is_correct": evaluation.is_correct,
            "rubrics": [rubric.model_dump() for rubric in evaluation.rubrics],
            "max_score": max_score 
        })
    except InputGuardrailTripwireTriggered as e:
        # Handle guardrail violations
        guardrail_result = e.guardrail_result
        
        # Check which guardrail was triggered
        guardrail_function = guardrail_result.guardrail.guardrail_function
        output_info = guardrail_result.output.output_info
        
        if guardrail_function.__name__ == "profanity_guardrail":
            # Extract flagged categories for more specific message
            flagged_categories = getattr(output_info, 'flagged_categories', {})
            category_list = ", ".join(flagged_categories.keys())
            
            message = "Your submission contains inappropriate language."
            if category_list:
                message += f" Content was flagged in these categories: {category_list}."
            message += " Please revise your answer."
            
            return jsonify({
                "error": "Content policy violation",
                "message": message
            }), 400
            
        elif guardrail_function.__name__ == "relevance_guardrail":
            # Handle relevance violation
            return jsonify({
                "error": "Off-topic response",
                "message": "Your answer appears to be unrelated to the question. Please provide a relevant response to the question being asked."
            }), 400
        else:
            # Handle any other guardrail violations
            return jsonify({
                "error": "Input policy violation",
                "message": "Your submission was rejected due to policy violations. Please review your answer and try again."
            }), 400

@app.route('/evaluate_stream', methods=['POST'])
def evaluate_answer_stream():
    data = request.json
    question = data.get('question', '')
    answer = data.get('answer', '')
    rubrics = data.get('rubrics')
    
    if not question or not answer:
        return jsonify({"error": "Both question and answer are required"}), 400
    
    # Format the input based on whether rubrics are provided
    if rubrics:
        user_input = f"Question: {question}\n\nStudent Answer: {answer}\n\nRubrics: {json.dumps(rubrics)}"
    else:
        user_input = f"Question: {question}\n\nStudent Answer: {answer}"
    
    # Create a queue to communicate between the async and sync worlds
    q = queue.Queue()
    
    def generate():
        # Flag to track when streaming is complete
        done = False
        
        def run_async_code():
            async def process_stream():
                try:
                    result = Runner.run_streamed(answer_evaluator, input=user_input)
                    
                    # Buffer to collect the full response
                    full_response = ""
                    
                    async for event in result.stream_events():
                        if hasattr(event, 'type') and event.type == "raw_response_event" and hasattr(event.data, 'delta'):
                            chunk = event.data.delta
                            full_response += chunk
                            q.put(f"data: {chunk}\n\n")
                    
                    # When streaming is complete, try to parse as JSON and send a final structured message
                    try:
                        # Try to extract the JSON part if it's embedded in the response
                        response_data = json.loads(full_response)
                        q.put(f"data: EVALUATION_COMPLETE\n\n")
                    except:
                        # If parsing fails, just send an end signal
                        q.put(f"data: EVALUATION_COMPLETE\n\n")
                    
                except InputGuardrailTripwireTriggered as e:
                    # Handle guardrail violations
                    guardrail_result = e.guardrail_result
                    
                    # Check which guardrail was triggered
                    guardrail_function = guardrail_result.guardrail.guardrail_function
                    output_info = guardrail_result.output.output_info
                    
                    if guardrail_function.__name__ == "profanity_guardrail":
                        # Extract flagged categories for more specific message
                        flagged_categories = getattr(output_info, 'flagged_categories', {})
                        category_list = ", ".join(flagged_categories.keys())
                        
                        error_message = "Your submission contains inappropriate language."
                        if category_list:
                            error_message += f" Content was flagged in: {category_list}."
                        error_message += " Please revise your answer."
                    elif guardrail_function.__name__ == "relevance_guardrail":
                        error_message = "Your answer appears to be unrelated to the question. Please provide a relevant response."
                    else:
                        error_message = "Your submission was rejected due to policy violations."
                    
                    q.put(f"data: {error_message}\n\n")
                    q.put(f"data: GUARDRAIL_TRIGGERED\n\n")
                
                # Signal that we're done
                q.put(None)
            
            # Create new event loop for the thread
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.run_until_complete(process_stream())
        
        # Start a thread to run the async code
        thread = threading.Thread(target=run_async_code)
        thread.start()
        
        # Yield data as it becomes available
        while not done:
            chunk = q.get()
            if chunk is None:  # None is our signal that stream is complete
                done = True
            else:
                yield chunk
    
    return Response(stream_with_context(generate()), 
                  mimetype='text/event-stream',
                  headers={'Content-Type': 'text/event-stream',
                          'Cache-Control': 'no-cache',
                          'Transfer-Encoding': 'chunked'})

if __name__ == '__main__':
    app.run(debug=True, port=os.getenv("PORT", default=5000))
