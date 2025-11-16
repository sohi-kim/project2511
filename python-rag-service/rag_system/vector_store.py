import logging
from typing import List, Dict, Optional
from pinecone import Pinecone, ServerlessSpec

logger = logging.getLogger(__name__)

class PineconeVectorStore:
    """Pinecone vector database wrapper for recipe storage and retrieval"""
    
    def __init__(self, api_key: str, environment: str, index_name: str, dimension: int = 1024):
        """
        Initialize Pinecone vector store
        
        Args:
            api_key: Pinecone API key
            environment: Pinecone environment
            index_name: Index name for recipes
            dimension: Embedding dimension
        """
        self.api_key = api_key
        self.environment = environment
        self.index_name = index_name
        self.dimension = dimension
        
        # Initialize Pinecone
        self.pc = Pinecone(api_key=api_key)
        
        # Get or create index
        self.index = self._get_or_create_index()
        
        logger.info(f"✅ Pinecone vector store initialized - Index: {index_name}")
    
    def _get_or_create_index(self):
        """Get existing index or create new one"""
        if self.index_name not in self.pc.list_indexes().names():
            logger.info(f"Creating new index: {self.index_name}")
            self.pc.create_index(
                name=self.index_name,
                dimension=self.dimension,
                metric="cosine",
                spec=ServerlessSpec(
                    cloud="gcp",
                    region="us-central1"
                )
            )
        
        return self.pc.Index(self.index_name)
    
    def upsert(self, id: str, vector: List[float], metadata: Dict) -> str:
        """
        Upsert vector with metadata
        
        Args:
            id: Document ID
            vector: Embedding vector
            metadata: Recipe metadata
        
        Returns:
            ID of upserted document
        """
        try:
            self.index.upsert(
                vectors=[(id, vector, metadata)],
                namespace=""
            )
            logger.debug(f"Upserted document: {id}")
            return id
        except Exception as e:
            logger.error(f"Upsert error: {str(e)}")
            raise
    
    def query(self, vector: List[float], top_k: int = 10, 
              appliance_filter: Optional[str] = None) -> List[Dict]:
        """
        Query similar vectors
        
        Args:
            vector: Query embedding vector
            top_k: Number of results to return
            appliance_filter: Optional appliance filter
        
        Returns:
            List of similar documents with scores
        """
        try:
            filter_dict = None
            if appliance_filter:
                filter_dict = {"appliance": {"$eq": appliance_filter}}
            
            results = self.index.query(
                vector=vector,
                top_k=top_k,
                include_metadata=True,
                filter=filter_dict
            )
            
            # Format results
            formatted_results = []
            for match in results.get("matches", []):
                formatted_results.append({
                    "id": match["id"],
                    "score": match["score"],
                    **match.get("metadata", {})
                })
            
            return formatted_results
            
        except Exception as e:
            logger.error(f"Query error: {str(e)}")
            raise
    
    def delete(self, doc_id: str) -> bool:
        """Delete document from index"""
        try:
            self.index.delete(ids=[doc_id])
            logger.debug(f"Deleted document: {doc_id}")
            return True
        except Exception as e:
            logger.error(f"Delete error: {str(e)}")
            return False
    
    def get_index_stats(self) -> Dict:
        """Get index statistics"""
        try:
            stats = self.index.describe_index_stats()
            return {
                "total_vectors": stats.get("total_vector_count", 0),
                "dimension": stats.get("dimension", 0),
                "index_name": self.index_name
            }
        except Exception as e:
            logger.error(f"Error getting index stats: {str(e)}")
            return {}
