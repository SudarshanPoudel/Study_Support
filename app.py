from typing import List
from flask import Flask, request, jsonify
from flask_cors import CORS
import io
import json
from collections import deque
import time
import sys
import os

# Add root directory to the system path for importing local modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Import required custom modules
from vectordb.pdf_processing import read_pdf, pdf_to_chunks
from vectordb.chromadb_storage import store_chunks, query_chunks, advance_query_search
from llm.services import generate_flashcards, answer_question, create_quiz, generate_summary

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing

# Default route to check if the server is running
@app.route('/')
def index():
    return '<h1>Server started successfully...</h1>'

# Endpoint to upload and process PDF files
@app.route('/upload', methods=['POST'])
def upload_files():
    try:
        # Check if any files were uploaded
        if 'files[]' not in request.files:
            return jsonify({"response": "No files selected..."}), 400
        
        files = request.files.getlist('files[]')  # Get list of uploaded files
        all_chunks = []
        
        # Process each uploaded PDF
        for file in files:
            if file and file.filename.endswith('.pdf'):
                file_chunks = pdf_to_chunks(io.BytesIO(file.read()))  # Convert PDF to chunks
                # Append filename to each chunk for storage
                file_chunks_with_filename = [item + (file.filename,) for item in file_chunks]
                all_chunks += file_chunks_with_filename

        store_chunks(all_chunks)  # Store chunks in the database
        return jsonify({'response': 'All PDFs Uploaded Successfully.'}), 200

    except Exception as e:
        print(f'Error: {e}')
        return jsonify({'response': 'Error while uploading the PDFs!'}), 500

# Conversation history with a maximum of 10 entries
conversation_history = deque(maxlen=10)

# Chatbot endpoint

chat_times = []
@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message')
    use_advanced_search = data.get('advanceMode')  

    # Convert conversation history to string format
    history_list = list(conversation_history)
    history_str = "\n".join(
        [f"{'User' if i % 2 == 0 else 'Assistant'}: {msg}" for i, msg in enumerate(history_list)]
    )

    # Use advanced search or basic chunk query
    if use_advanced_search:
        relevant_chunks, refined_message = advance_query_search(query=user_message, chat_history=history_str, top_n=10)
        print(refined_message)
        response = answer_question(refined_message, json.dumps(relevant_chunks))
        conversation_history.append(refined_message)
    else:
        relevant_chunks = query_chunks(query=user_message, top_n=10, page_number_needed=True)
        response = answer_question(user_message, json.dumps(relevant_chunks), history_str)
        conversation_history.append(user_message)

    conversation_history.append(response)  # Store assistant's response
    return jsonify({"response": response})

# Flashcard generation endpoint
@app.route('/flashcard', methods=['POST'])
def flashcard():
    start_time = time.time()
    data = request.json
    topic = data.get('topic', '')

    # Fetch relevant chunks for the topic
    relevant_chunks = query_chunks(topic, top_n=5)
    
    # Generate flashcards from chunks
    response = generate_flashcards(" ".join(relevant_chunks), keyword=topic)
    end_time = time.time()

    print("Time taken: " + str(end_time-start_time))
    return jsonify({"response": response})

# Quiz generation endpoint
@app.route('/quiz', methods=['POST'])
def generate_quiz():
    data = request.json
    previous_score = str(data.get('prevScore'))
    previous_quiz = str(data.get('prevQuiz'))

    # Fetch random chunks to create a quiz
    random_chunks = query_chunks('', top_n=5)

    # Generate a new quiz based on the previous quiz and score
    response = create_quiz(" ".join(random_chunks), previous_score, previous_quiz)
    return jsonify({"response": response})

# Text summarization endpoint
@app.route('/summarize', methods=['POST'])
def summarize_text():
    start_time = time.time()
    data = request.json
    long_text = data.get('text')

    # Generate a summary of the provided text
    response = generate_summary(long_text)
    end_time = time.time()
    print("Text length : " + str(len(long_text)))
    print("Time taken: " + str(end_time-start_time))
    print("Time per 1000 words: " + str((end_time-start_time)/len(long_text) * 5000))
    return jsonify({"response": response})

# PDF file summarization endpoint
@app.route('/summarize_file', methods=['POST'])
def summarize_file():
    start_time = time.time()
    if 'file' not in request.files:
        return jsonify({'response': 'No file uploaded'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'response': 'No file selected'}), 400

    if file and file.filename.endswith('.pdf'):
        # Convert PDF to text and generate summary
        long_text = " ".join(read_pdf(io.BytesIO(file.read())))
        response = generate_summary(long_text)
        end_time = time.time()
        print("Text length : " + str(len(long_text)))
        print("Time taken: " + str(end_time-start_time))
        print("Time per 1000 words: " + str((end_time-start_time)/len(long_text) * 5000))

        return jsonify({"response": response})

    
    return jsonify({'error': 'Invalid file type'}), 400

if __name__ == '__main__':
    app.run(debug=True)