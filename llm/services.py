from llm.llm_endpoints import get_llm_response
from llm.prompts import (
    FLASHCARD_GENERATION_PROMPT, 
    QA_PROMPT, 
    QA_PROMPT_WITH_HISTORY, 
    QUIZ_GENERATION_PROMPT, 
    QUIZ_REFINE_PROMPT,
    SUMMARIZATION_PROMPT, 
    QUERY_MODIFICATION_PROMPT
)
import json

# Generate flashcards based on the given context and keyword
def generate_flashcards(context: str, keyword: str) -> str:
    prompt = FLASHCARD_GENERATION_PROMPT.replace("{{Context}}", context)
    prompt = prompt.replace("{Keyword}", keyword or 'Any topic from the content')
    flashcards = get_llm_response(prompt).split("```json\n[")[-1].split("\n]")[0]
    return flashcards

# Answer a question using context, with optional conversation history
def answer_question(question: str, context: str, history: str = '') -> str:
    prompt = (QA_PROMPT_WITH_HISTORY if history else QA_PROMPT).replace("{{Question}}", question)
    prompt = prompt.replace("{{Context}}", context)
    prompt = prompt.replace("{{History}}", history)
    return get_llm_response(prompt)

# Create a quiz using context and previous quiz details
def create_quiz(context: str, prev_score: int, prev_quiz: str) -> str:
    prompt = QUIZ_GENERATION_PROMPT.replace("{{Context}}", context)
    prompt = prompt.replace("{{Previous Score}}", str(prev_score))
    prompt = prompt.replace("{{Previous Quiz Content}}", prev_quiz)
    quiz = get_llm_response(prompt)

    prompt = QUIZ_REFINE_PROMPT.replace("{{QUIZ}}", quiz)
    return get_llm_response(prompt)

# Generate a summary of the provided text
def generate_summary(long_text: str) -> str:
    prompt = SUMMARIZATION_PROMPT.replace("{{Context}}", long_text)
    return get_llm_response(prompt)

# Modify a query using chat history
def format_query(query: str, chat_history: str) -> list:
    prompt = QUERY_MODIFICATION_PROMPT.replace("{{Question}}", query).replace("{{Chat_History}}", chat_history)
    questions = [q for q in get_llm_response(prompt).split("\n") if q]
    return questions
