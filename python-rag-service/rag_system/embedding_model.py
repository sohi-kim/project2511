import logging
from typing import List
from sentence_transformers import SentenceTransformer
import numpy as np
# pip install sentence-transformers -> torch , transformers 등 의존성 라이브러리 설치

logger = logging.getLogger(__name__)

class EmbeddingModel:
    """Korean-optimized embedding model using HuggingFace multilingual-e5"""
    
    def __init__(self, model_name: str = "multilingual-e5-large", cache_folder: str = "./models"):
        """
        Initialize embedding model
        
        Args:
            model_name: HuggingFace model name
            cache_folder: Local cache folder for models
        """
        self.model_name = model_name
        self.cache_folder = cache_folder
        
        logger.info(f"Loading embedding model: {model_name}")
        
        self.model = SentenceTransformer(model_name, cache_folder=cache_folder)
        
        # Get embedding dimension : 모델이 생성하는 문장 임베딩 벡터의 차원 수
        self.dimension = self.model.get_sentence_embedding_dimension()
        
        logger.info(f"✅ Embedding model loaded - Dimension: {self.dimension}")
    
    def embed(self, text: str) -> List[float]:
        """
        Generate embedding for a single text
        
        Args:
            text: Input text
        
        Returns:
            Embedding vector
        """
        try:
            # Add instruction for retrieval tasks : 
            # 자연어 처리(NLP)와 정보 검색(IR) 분야에서 자주 쓰이는 용어로, 사용자가 입력한 쿼리(query)에 대해
            # 관련성이 높은 문서, 문장, 혹은 데이터 항목을 찾아내는 작업
            text_with_instruction = f"Represent this recipe text for retrieval: {text}"
            
            embedding = self.model.encode(
                text_with_instruction,
                normalize_embeddings=True
            )
            
            return embedding.tolist()
        except Exception as e:
            logger.error(f"Embedding error: {str(e)}")
            raise
    
    def embed_batch(self, texts: List[str], batch_size: int = 32) -> List[List[float]]:
        """
        Generate embeddings for multiple texts
        
        Args:
            texts: List of input texts
            batch_size: Batch size for processing
        
        Returns:
            List of embedding vectors
        """
        try:
            texts_with_instruction = [
                f"Represent this recipe text for retrieval: {text}" for text in texts
            ]
            
            embeddings = self.model.encode(
                texts_with_instruction,
                batch_size=batch_size,
                normalize_embeddings=True,
                show_progress_bar=True
            )
            
            return embeddings.tolist()
        except Exception as e:
            logger.error(f"Batch embedding error: {str(e)}")
            raise
    
    def embed_query(self, query: str) -> List[float]:
        """
        Generate embedding for a query (different instruction from document)
        
        Args:
            query: Search query
        
        Returns:
            Query embedding vector
        """
        try:
            query_with_instruction = f"Represent this recipe search query: {query}"
            
            embedding = self.model.encode(
                query_with_instruction,
                normalize_embeddings=True
            )
            
            return embedding.tolist()
        except Exception as e:
            logger.error(f"Query embedding error: {str(e)}")
            raise
    
    def get_embedding_dimension(self) -> int:
        """Get embedding dimension"""
        return self.dimension
    
    def similarity(self, embedding1: List[float], embedding2: List[float]) -> float:
        """
        Calculate cosine similarity between two embeddings
        
        Args:
            embedding1: First embedding vector
            embedding2: Second embedding vector
        
        Returns:
            Similarity score (0-1)
        """
        vec1 = np.array(embedding1)
        vec2 = np.array(embedding2)
        # 코사인 유사도
        similarity = np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))
        return float(similarity)
