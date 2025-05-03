# knowledge_base.py
from langchain_community.document_loaders import TextLoader, DirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
import os

MAX_FAQ_CHUNKS = 10  # Maximum number of FAQ chunks to process

def setup_knowledge_base():
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    loader = DirectoryLoader("./docs", glob="*.txt", loader_cls=TextLoader)
    documents = loader.load()
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    docs = text_splitter.split_documents(documents)
    print(f"Total documents loaded: {len(docs)}")
    for doc in docs:
        print(f"Source: {doc.metadata.get('source')}, Content snippet: {doc.page_content[:100]}...")
    # Filter to limit FAQ-related chunks
    faq_docs = [doc for doc in docs if "faqs.txt" in doc.metadata.get("source", "")]
    other_docs = [doc for doc in docs if "faqs.txt" not in doc.metadata.get("source", "")]
    if len(faq_docs) > MAX_FAQ_CHUNKS:
        faq_docs = faq_docs[:MAX_FAQ_CHUNKS]
        print(f"Warning: FAQ chunks exceed {MAX_FAQ_CHUNKS}. Limiting to {MAX_FAQ_CHUNKS} chunks.")
    docs = faq_docs + other_docs
    vectorstore = Chroma.from_documents(documents=docs, embedding=embeddings)
    print(f"Final documents loaded into vectorstore: {len(docs)} (limited to {MAX_FAQ_CHUNKS} FAQ chunks).")
    return vectorstore

def query_knowledge_base(query, vectorstore):
    docs = vectorstore.similarity_search(query, k=1)
    if docs:
        print(f"Query: {query}, Matched: {docs[0].page_content}")
        return docs[0].page_content
    print(f"No match found for query: {query}")
    return None