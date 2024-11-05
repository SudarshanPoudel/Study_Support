# Study Support
This is a RAG based project that allows users to upload multiple local or online PDFs and then ask questions, generate quiz, generate flashcards and get summaries based on content of uploaded pdfs. It uses a vector database to store and query the content and a language model to generate responses based on the PDF's information.

**Technologies Used:** 
- **Flask**: For creating the web API.
- **ChromaDB**: For storing and querying vector representations of the PDF content.
- **Gemini**: For the language model used to generate responses.
- **Python**: The programming language used for development.

## Installation and Configuration

1. **Clone the Repository**

   ```bash
   git clone https://github.com/SudarshanPoudel/Study_Support.git
   cd Study_Support
   ```
2. **Set Up a Virtual Environment**

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
   ```

3. **Install Required Packages**

4. **Set Up API Keys**

   Create a .env file in your  project directory and add your API keys for Gemini as
   ```text
   GEMINI_API_KEY=<Your api key>
   ```
5. **Run the Flask Application**

   ```bash
   flask run
   ```

6. **Open the index file**

    Open *frontend/index.html* file using live server and start interactive study session. 
