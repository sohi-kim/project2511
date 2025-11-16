import logging
from typing import List, Dict, Optional
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain.chains import RetrievalQA
from langchain.memory import ConversationBufferMemory
import asyncio

logger = logging.getLogger(__name__)

class RecipeRAGChain:
    """LangChain-based RAG chain for recipe recommendation"""
    
    def __init__(self, embedding_model, vector_store, llm_api_key: str):
        """
        Initialize RAG chain
        
        Args:
            embedding_model: Embedding model instance
            vector_store: Pinecone vector store instance
            llm_api_key: OpenAI API key
        """
        self.embedding_model = embedding_model
        self.vector_store = vector_store
        self.llm_api_key = llm_api_key
        
        # Initialize LLM
        self.llm = ChatOpenAI(
            model="gpt-4",
            api_key=llm_api_key,
            temperature=0.7,
            max_tokens=1500
        )
        
        # Initialize conversation memory
        self.memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True
        )
        
        logger.info("✅ RAG chain initialized")
    
    async def search(self, query: str, appliance: Optional[str] = None, 
                     top_k: int = 10) -> List[Dict]:
        """
        Search for recipes using RAG
        
        Args:
            query: Search query
            appliance: Optional appliance filter
            top_k: Number of results
        
        Returns:
            List of recipe results
        """
        try:
            # Generate query embedding
            query_embedding = self.embedding_model.embed_query(query)
            
            # Search in vector store
            search_results = self.vector_store.query(
                vector=query_embedding,
                top_k=top_k,
                appliance_filter=appliance
            )
            
            logger.info(f"Found {len(search_results)} recipes for query: {query}")
            
            return search_results
            
        except Exception as e:
            logger.error(f"Search error: {str(e)}")
            raise
    
    async def generate_recommendation(self, query: str, 
                                     search_results: List[Dict]) -> Dict:
        """
        Generate LLM-based recommendation from search results
        
        Args:
            query: Original search query
            search_results: Results from vector search
        
        Returns:
            LLM-generated recommendation
        """
        try:
            if not search_results:
                return {
                    "recommendation": "관련 레시피를 찾을 수 없습니다.",
                    "reason": "검색 결과가 없습니다."
                }
            
            # Prepare context from search results
            context = "다음은 검색된 레시피입니다:\n\n"
            for i, recipe in enumerate(search_results[:3], 1):
                context += f"{i}. {recipe.get('title', '레시피')}\n"
                context += f"   설명: {recipe.get('description', '설명 없음')}\n"
                context += f"   가전제품: {recipe.get('appliance', '미지정')}\n\n"
            
            # Create LLM prompt
            prompt = f"""사용자 질의: {query}

{context}

위의 검색 결과를 바탕으로 사용자에게 가장 적합한 레시피를 추천하고 이유를 설명해 주세요.
한글로 자연스럽고 친절하게 답변해 주세요."""
            
            # Get LLM response
            response = self.llm.invoke(prompt)
            
            return {
                "recommendation": response.content,
                "source_recipes": [r.get('id') for r in search_results[:3]]
            }
            
        except Exception as e:
            logger.error(f"Recommendation generation error: {str(e)}")
            return {
                "recommendation": "레시피 추천 생성 중 오류가 발생했습니다.",
                "error": str(e)
            }
    
    async def chat(self, user_message: str) -> Dict:
        """
        Multi-turn conversation with recipe recommendations
        
        Args:
            user_message: User's message
        
        Returns:
            Assistant response with recommendations
        """
        try:
            # Search for relevant recipes
            search_results = await self.search(user_message, top_k=5)
            
            # Generate recommendation
            recommendation = await self.generate_recommendation(
                user_message,
                search_results
            )
            
            # Add to conversation memory
            self.memory.chat_memory.add_user_message(user_message)
            self.memory.chat_memory.add_ai_message(recommendation["recommendation"])
            
            return {
                "message": recommendation["recommendation"],
                "recipes": search_results[:3]
            }
            
        except Exception as e:
            logger.error(f"Chat error: {str(e)}")
            return {
                "message": "대화 처리 중 오류가 발생했습니다.",
                "error": str(e)
            }
    
    def clear_memory(self):
        """Clear conversation memory"""
        self.memory.clear()
        logger.info("Conversation memory cleared")
    
    async def batch_index_recipes(self, recipes: List[Dict]) -> Dict:
        """
        Batch index multiple recipes
        
        Args:
            recipes: List of recipe data
        
        Returns:
            Indexing statistics
        """
        try:
            indexed_count = 0
            failed_count = 0
            
            for recipe in recipes:
                try:
                    # Prepare recipe text
                    recipe_text = f"{recipe.get('title', '')} {recipe.get('description', '')} {recipe.get('ingredients', '')}"
                    
                    # Generate embedding
                    embedding = self.embedding_model.embed(recipe_text)
                    
                    # Index in vector store
                    self.vector_store.upsert(
                        id=recipe.get("id"),
                        vector=embedding,
                        metadata=recipe
                    )
                    
                    indexed_count += 1
                    
                except Exception as e:
                    logger.error(f"Error indexing recipe {recipe.get('id')}: {str(e)}")
                    failed_count += 1
            
            return {
                "total": len(recipes),
                "indexed": indexed_count,
                "failed": failed_count
            }
            
        except Exception as e:
            logger.error(f"Batch indexing error: {str(e)}")
            raise
