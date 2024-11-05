import os
import random
import sys
from dotenv import load_dotenv
from uuid import uuid4
from typing import List, Tuple

from langchain_core.documents import Document
from langchain_community.document_transformers import LongContextReorder
from langchain_chroma import Chroma
from langchain.retrievers import EnsembleRetriever
from langchain_community.retrievers import BM25Retriever
from sentence_transformers import CrossEncoder
from langchain_huggingface.embeddings import HuggingFaceEmbeddings

from llm.services import format_query

# Initialize Default values
load_dotenv()
cross_encoder = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')
DEFAULT_COLLECTION_NAME = 'all_notes'

embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2")

# Ensure module path is correctly set
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Initialize Chroma vector store
def initialize_chroma_client():
    return Chroma(collection_name=DEFAULT_COLLECTION_NAME, embedding_function=embeddings)

# Store text chunks in Chroma vector store, replacing existing data if any
def store_chunks(text_chunks: List[Tuple[str, int, str]]):
    try:
        collection = initialize_chroma_client()
        collection.delete_collection()  # Clear existing data
    except:
        pass

    # Reinitialize collection and add new documents
    collection = initialize_chroma_client()
    documents = [
        Document(
            page_content=content,
            metadata={"page_number": page_number, "file_name": file_name},
            id=index
        )
        for index, (content, page_number, file_name) in enumerate(text_chunks, start=1)
    ]
    uuids = [str(uuid4()) for _ in range(len(documents))]
    collection.add_documents(documents=documents, ids=uuids)

# Retrieve top_n chunks similar to a query
def query_chunks(query: str, top_n: int = 3, page_number_needed: bool = False) -> List:
    collection = initialize_chroma_client()

    # If no query is provided, sample random documents
    if not query:
        all_docs = collection.get()['documents']
        try:
            content = random.sample(all_docs, top_n)
        except ValueError:
            content = all_docs
    else:
        results = collection.similarity_search(query, k=top_n)
        content = [
            {'content': data.page_content, 'page_number': data.metadata['page_number'], 'file_name': data.metadata['file_name']}
            if page_number_needed else data.page_content
            for data in results
        ]

    return content

# Advanced search using multi-query retrieval, ensemble retrievers, and re-ranking
def advance_query_search(query: str, chat_history: str, top_n: int = 5):
    reordering = LongContextReorder()
    collection = initialize_chroma_client()
    db_data = collection.get()

    # Convert documents for BM25 retriever
    all_docs = [
        Document(page_content=text, metadata=metadata)
        for text, metadata in zip(db_data['documents'], db_data['metadatas'])
    ]
    
    # Initialize retrievers
    bm25_retriever = BM25Retriever.from_documents(all_docs)
    bm25_retriever.k = top_n
    chroma_retriever = collection.as_retriever(search_kwargs={"k": top_n})
    
    # Combine retrievers into ensemble retriever
    ensemble_retriever = EnsembleRetriever(
        retrievers=[bm25_retriever, chroma_retriever], weights=[0.3, 0.7]
    )

    # Format the query using chat history
    queries = format_query(query, chat_history)

    # Perform multi-query retrieval and ensure unique results
    unique_docs = []
    for sub_query in queries:
        contents = ensemble_retriever.invoke(sub_query)
        for data in contents:
            doc = {
                'content': data.page_content,
                'page_number': data.metadata['page_number'],
                'file_name': data.metadata['file_name']
            }
            if doc not in unique_docs:
                unique_docs.append(doc)

    # Score and re-rank documents using cross-encoder
    pairs = [[query, doc['content']] for doc in unique_docs]
    scores = cross_encoder.predict(pairs)
    scored_docs = sorted(zip(scores, unique_docs), key=lambda x: x[0], reverse=True)

    # Reorder based on long-context needs and return results
    re_ranked_docs = [doc for _, doc in scored_docs[:top_n]]
    reordered_docs = reordering.transform_documents(re_ranked_docs)

    return reordered_docs, queries[0]
