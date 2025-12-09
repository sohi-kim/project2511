#!/usr/bin/env python3
import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
from datetime import datetime
import redis
from dotenv import load_dotenv
# pip install python-multipart
# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Import RAG system modules
from rag_system.vector_store import PineconeVectorStore
from rag_system.embedding_model import EmbeddingModel
from rag_system.llm_chain import RecipeRAGChain
from rag_system.korean_processor import KoreanTextProcessor
from datetime import datetime, timezone
# ==========================
# Pydantic Models
# ==========================

class RecipeSearchRequest(BaseModel):
    query: str
    appliance: Optional[str] = None
    limit: int = 10

class RecipeSearchResponse(BaseModel):
    recipe_id: str
    title: str
    description: str
    appliance: str
    ingredients: str
    instructions: str
    cuisine_type: Optional[str] = None
    difficulty_level: Optional[str] = None
    relevance_score: float

class SearchResultResponse(BaseModel):
    total_count: int
    recipes: List[RecipeSearchResponse]
    query: str
    timestamp: str

# ==========================
# Global Components
# ==========================

vector_store: Optional[PineconeVectorStore] = None
embedding_model: Optional[EmbeddingModel] = None
rag_chain: Optional[RecipeRAGChain] = None
text_processor: Optional[KoreanTextProcessor] = None
redis_client: Optional[redis.Redis] = None

# ==========================
# Initialization
# ==========================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle management"""
    # Startup
    logger.info("🚀 Starting RAG Service...")
    
    global vector_store, embedding_model, rag_chain, text_processor, redis_client
    
    try:
        # Initialize Korean text processor
        text_processor = KoreanTextProcessor()
        logger.info("✅ Korean text processor initialized")
        
        # Initialize embedding model
        embedding_model = EmbeddingModel(
            model_name=os.getenv("EMBEDDING_MODEL", "intfloat/multilingual-e5-large"),
            # cache_folder=os.getenv("MODEL_CACHE_DIR", "./models")  # docker 에서 기본 캐쉬 경로 ~/.cache/huggingface/hub 사용하지 않을 때
        )
        logger.info("✅ Embedding model initialized")
        
        # Initialize Pinecone vector store
        vector_store = PineconeVectorStore(
            api_key=os.getenv("PINECONE_API_KEY"),
            environment=os.getenv("PINECONE_ENVIRONMENT", "us-east1-aws"),
            index_name=os.getenv("PINECONE_INDEX", "recipes"),
            dimension=embedding_model.get_embedding_dimension()
        )
        logger.info("✅ Pinecone vector store initialized")
        
        # Initialize RAG chain
        rag_chain = RecipeRAGChain(
            embedding_model=embedding_model,
            vector_store=vector_store,
            llm_api_key=os.getenv("OPENAI_API_KEY")
        )
        logger.info("✅ RAG chain initialized")
        
        # Initialize Redis cache
        redis_host = os.getenv("REDIS_HOST", "localhost")
        redis_port = int(os.getenv("REDIS_PORT", 6379))
        redis_password = os.getenv("REDIS_PASSWORD")  #NONE
        
        redis_client = redis.Redis(
            host=redis_host,
            port=redis_port,
            password=redis_password,
            decode_responses=True,
            socket_connect_timeout=5
        )
        redis_client.ping()
        logger.info("✅ Redis cache connected")
        
        logger.info("🎉 RAG Service started successfully")
        
    except Exception as e:
        logger.error(f"❌ Initialization error: {str(e)}")
        raise
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down RAG Service...")
    if redis_client:
        redis_client.close()
    logger.info("✅ RAG Service stopped")

# ==========================
# FastAPI Application
# ==========================

app = FastAPI(
    title="Kitchen Recipe RAG Service",
    description="AI-powered recipe search using RAG",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:8080").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# ==========================
# Routes
# ==========================
from fastapi import FastAPI, UploadFile, Form
from langchain_text_splitters import RecursiveCharacterTextSplitter
# import fitz   # pip install PyMuPDF
import pdfplumber   # pip install pdfplumber - 한글 최적
from io import BytesIO

import re

def is_cid_text(text: str):
    # CID 패턴이 매우 반복되면 CIDFont 기반 PDF
    cid_pattern = r"\(cid:\d+\)"
    matches = re.findall(cid_pattern, text)
    
    # 전체 텍스트 중 상당 부분이 CID 패턴이면 텍스트 없는 PDF
    if len(matches) > 10 and len(matches) / max(1, len(text)) > 0.1:
        return True
    return False

def contains_korean(text):
    return any("\uac00" <= ch <= "\ud7a3" for ch in text)

import pytesseract    # pip install pytesseract
from pdf2image import convert_from_bytes    # pip install pdf2image

@app.post("/ingest")
async def ingest_recipe(
    file: UploadFile,
    fileName: str = Form(...),
    manufacturer: str = Form(...),
    productName: str = Form(...)
):
    #     global vector_store, embedding_model, rag_chain, text_processor, redis_client
    # 1️⃣ PDF 텍스트 추출
    # CID PDF 는 텍스트 추출 못함. OCR 사용 
    # sudo apt update
    # sudo apt install tesseract-ocr
    # sudo apt install tesseract-ocr-kor


    full_text = ""
    with pdfplumber.open(BytesIO(await file.read())) as pdf:
         for page in pdf.pages:
            text = page.extract_text() or ""

            if is_cid_text(text) or not contains_korean(text):
                # OCR fallback
                img = page.to_image(resolution=300).original
                ocr_text = pytesseract.image_to_string(img, lang="kor")
                full_text += ocr_text
            else:
                full_text += text

    # 2️⃣ 청킹
    splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=100)
    chunks = splitter.split_text(full_text)

    # 3️⃣ 임베딩 생성
    vectors = embedding_model.embed_batch(chunks)

    # 4️⃣ Pinecone에 저장
    import hashlib
    file_hash = hashlib.md5(f"{manufacturer}_{productName}".encode('utf-8')).hexdigest()   # id 식별
    upserts = []
    for i, v in enumerate(vectors):
        upserts.append({
            "id":  f"{file_hash}_{i}",
            "values": v,
            "metadata": {
                "manufacturer": manufacturer,
                "productName": productName,
                "chunk_id": i,
                "text": chunks[i]
            }
        })

    vector_store.upsert(vectors=upserts)

    return {"status": "success", "chunks": len(chunks)}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "UP",
        "service": "recipe-rag-service",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.post("/search", response_model=SearchResultResponse)
async def search_recipes(request: RecipeSearchRequest, background_tasks: BackgroundTasks):
    """
    Search for recipes using RAG
    
    Args:
        request: Search request with query, appliance, and limit
        background_tasks: Background tasks for async operations
    
    Returns:
        SearchResultResponse: List of matching recipes
    """
    try:
        logger.info(f"🔍 Search request: query='{request.query}', appliance='{request.appliance}'")
        
        # Check cache
        cache_key = f"recipe_search:{request.query}:{request.appliance}:{request.limit}"
        cached_result = redis_client.get(cache_key) if redis_client else None
        
        if cached_result:
            logger.info(f"✅ Cache hit for query: {request.query}")
            return json.loads(cached_result)
        
        # Process query using Korean text processor
        processed_query = text_processor.process(request.query) if text_processor else request.query
        logger.info(f"📝 Processed query: {processed_query}")
        
        # Generate embeddings and search
        search_results = await rag_chain.search(
            query=processed_query,
            appliance=request.appliance,
            top_k=request.limit
        )
        
        # Format response
        recipes = [
            RecipeSearchResponse(
                recipe_id=result["id"],
                title=result.get("title", ""),
                description=result.get("description", ""),
                appliance=result.get("appliance", ""),
                ingredients=result.get("ingredients", ""),
                instructions=result.get("instructions", ""),
                cuisine_type=result.get("cuisine_type"),
                difficulty_level=result.get("difficulty_level"),
                relevance_score=result.get("score", 0.0)
            )
            for result in search_results
        ]
        
        response = SearchResultResponse(
            total_count=len(recipes),
            recipes=recipes,
            query=request.query,
            timestamp=datetime.now(timezone.utc).isoformat()
        )
        
        # Cache result
        if redis_client:
            background_tasks.add_task(
                lambda: redis_client.setex(
                    cache_key,
                    3600,  # 1 hour TTL
                    response.model_dump_json()
                )
            )
        
        logger.info(f"✅ Found {len(recipes)} recipes for query: {request.query}")
        return response
        
    except Exception as e:
        logger.error(f"❌ Search error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/index-recipe")
async def index_recipe(recipe_data: dict):
    """
    Index a new recipe into the vector database
    
    Args:
        recipe_data: Recipe metadata and content
    
    Returns:
        Indexing result
    """
    try:
        logger.info(f"📥 Indexing recipe: {recipe_data.get('id')}")
        
        # Generate embeddings for recipe
        text_content = f"{recipe_data.get('title', '')} {recipe_data.get('description', '')} {recipe_data.get('ingredients', '')}"
        
        embedding = embedding_model.embed(text_content)
        
        # Index in Pinecone
        vector_id = vector_store.upsert(
            id=recipe_data.get("id"),
            vector=embedding,
            metadata=recipe_data
        )
        
        logger.info(f"✅ Recipe indexed successfully: {vector_id}")
        return {"status": "success", "vector_id": vector_id}
        
    except Exception as e:
        logger.error(f"❌ Indexing error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/suggestions")
async def get_suggestions(prefix: str, limit: int = 10):
    """
    Get recipe suggestions based on prefix
    
    Args:
        prefix: Search prefix
        limit: Number of suggestions
    
    Returns:
        List of suggestions
    """
    try:
        # This would be implemented based on your needs
        logger.info(f"💡 Suggestions request: prefix='{prefix}'")
        return {
            "suggestions": [],
            "prefix": prefix
        }
    except Exception as e:
        logger.error(f"❌ Suggestions error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    uvicorn.run(
        app,
        host=host,
        port=port,
        workers=int(os.getenv("WORKERS", 2))   
    )  # 애플리케이션을 동시에 실행할 프로세스(worker process) 개수. uvicorn 은 ASGI 서버
# uvicorn main:app --host 0.0.0.0 --port 8000 --workers 2    

