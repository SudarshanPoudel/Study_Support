import PyPDF2
from langchain.text_splitter import RecursiveCharacterTextSplitter
from typing import List, Tuple, BinaryIO

# Function to read text from a PDF file, page by page
def read_pdf(pdf_file: BinaryIO) -> List[str]:
    pdf_reader = PyPDF2.PdfReader(pdf_file)
    text_per_page = []

    # Extract text from each page in the PDF
    for page_num in range(len(pdf_reader.pages)):
        page = pdf_reader.pages[page_num]
        text_per_page.append(page.extract_text())

    return text_per_page  # List where each element contains the text of one page

# Function to convert the PDF text into smaller chunks with overlap
def pdf_to_chunks(pdf_file: BinaryIO, chunk_size: int = 2000, overlap: int = 200) -> List[Tuple[str, int]]:
    text_per_page = read_pdf(pdf_file)  # Get text from the PDF
    result_chunks = []
    
    # Initialize the text splitter with the chunk size, overlap, and separators
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=overlap,
        separators=['\n\n', '.', '?', '!']
    )

    # Split the text from each page into chunks
    for page_num, page_text in enumerate(text_per_page, start=1):
        chunks = text_splitter.split_text(page_text)

        # Append each chunk with its corresponding page number
        result_chunks.extend((chunk, page_num) for chunk in chunks if chunk)

    return result_chunks  # List of (chunk, page_number) tuples
