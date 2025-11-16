import logging
import re
from typing import List
import unicodedata

logger = logging.getLogger(__name__)

class KoreanTextProcessor:
    """Korean text preprocessing and normalization"""
    
    def __init__(self):
        """Initialize Korean text processor"""
        logger.info("Initializing Korean text processor")
        
        # Korean-specific stopwords
        self.korean_stopwords = {
            '은', '는', '이', '가', '을', '를', '에', '에서', '의', 
            '와', '과', '도', '도록', '하다', '되다', '있다', '없다',
            '같다', '다르다', '많다', '적다', '크다', '작다',
            '좋다', '나쁘다', '새로운', '낡은', '빠른', '느린'
        }
    
    def process(self, text: str) -> str:
        """
        Process Korean text
        
        Args:
            text: Input text
        
        Returns:
            Processed text
        """
        # Normalize Unicode
        text = unicodedata.normalize('NFC', text)
        
        # Lowercase
        text = text.lower()
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        # Remove special characters but keep Korean and common symbols
        text = re.sub(r'[^\w\s가-힣a-z0-9\(\)\[\]\{\}]', '', text)
        
        # Remove stopwords (optional, can be disabled for better semantic search)
        # tokens = [token for token in text.split() if token not in self.korean_stopwords]
        # text = ' '.join(tokens)
        
        return text
    
    def tokenize(self, text: str) -> List[str]:
        """
        Simple tokenization (split by space)
        For more advanced tokenization, use KoNLPy
        
        Args:
            text: Input text
        
        Returns:
            List of tokens
        """
        processed_text = self.process(text)
        tokens = processed_text.split()
        return tokens
    
    def remove_stopwords(self, tokens: List[str]) -> List[str]:
        """Remove Korean stopwords from token list"""
        return [token for token in tokens if token not in self.korean_stopwords]
    
    def extract_keywords(self, text: str, num_keywords: int = 5) -> List[str]:
        """
        Extract important keywords from text
        
        Args:
            text: Input text
            num_keywords: Number of keywords to extract
        
        Returns:
            List of keywords
        """
        tokens = self.tokenize(text)
        tokens = self.remove_stopwords(tokens)
        
        # Filter out single characters and very short tokens
        tokens = [t for t in tokens if len(t) > 1]
        
        # Get unique tokens and limit to num_keywords
        keywords = list(set(tokens))[:num_keywords]
        
        return keywords
    
    def normalize_special_chars(self, text: str) -> str:
        """Normalize special characters in Korean text"""
        # Common Korean text normalization
        # ㄴ -> 은, ㄹ -> 을 등의 변환
        
        # Remove combining marks
        text = ''.join(c for c in text if not unicodedata.combining(c))
        
        return text
    
    def split_into_sentences(self, text: str) -> List[str]:
        """
        Split Korean text into sentences
        
        Args:
            text: Input text
        
        Returns:
            List of sentences
        """
        # Korean sentence splitters
        sentences = re.split(r'[.!?\n]+', text)
        sentences = [s.strip() for s in sentences if s.strip()]
        return sentences
    
    @staticmethod
    def is_korean(text: str) -> bool:
        """Check if text contains Korean characters"""
        korean_pattern = re.compile('[\uac00-\ud7a3]')
        return bool(korean_pattern.search(text))
    
    @staticmethod
    def contains_recipe_keywords(text: str) -> bool:
        """Check if text contains recipe-related keywords"""
        recipe_keywords = [
            '요리', '레시피', '음식', '밥', '국', '찜', '구이', '볶음',
            '젓가락', '숟가락', '냄비', '프라이팬', '오븐', '전자레인지',
            '재료', '만드는법', '조리', '끓이다', '볶다', '찌다',
            '무침', '비빔', '절임', '조림', '튀김', '구이'
        ]
        text_lower = text.lower()
        return any(keyword in text_lower for keyword in recipe_keywords)
    
    def preprocess_recipe_text(self, recipe_data: dict) -> str:
        """
        Preprocess recipe data into searchable text
        
        Args:
            recipe_data: Recipe dictionary with title, ingredients, instructions, etc.
        
        Returns:
            Combined preprocessed text
        """
        parts = []
        
        # Priority: title, description, ingredients, instructions
        if 'title' in recipe_data:
            parts.append(recipe_data['title'])
        
        if 'description' in recipe_data:
            parts.append(recipe_data['description'])
        
        if 'appliance' in recipe_data:
            parts.append(recipe_data['appliance'])
        
        if 'ingredients' in recipe_data:
            parts.append(recipe_data['ingredients'])
        
        if 'instructions' in recipe_data:
            parts.append(recipe_data['instructions'])
        
        if 'category' in recipe_data:
            parts.append(recipe_data['category'])
        
        combined_text = ' '.join(parts)
        return self.process(combined_text)
