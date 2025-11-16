# 🍳 Kitchen Recipe RAG System

Python LangChain + Spring Boot + React + Redis를 활용한 주방가전별 요리 검색 시스템

## 📋 프로젝트 개요

본 프로젝트는 주방가전(전기밥솥, 쥬서기, 믹서기 등)의 매뉴얼에 포함된 요리책을 AI 기반 RAG(Retrieval-Augmented Generation) 시스템으로 검색하고, 사용자의 질문에 관련 요리를 추천하는 완전한 풀스택 애플리케이션입니다.

### ✨ 핵심 기능

- 🔍 **한글 최적화 RAG 검색**: Pinecone 벡터 DB + LangChain으로 정확한 한글 요리 검색
- 👤 **JWT 기반 사용자 인증**: 안전한 토큰 기반 사용자 관리
- ❤️ **즐겨찾기**: 마음에 드는 요리를 개인 컬렉션으로 관리
- ⚡ **Redis 캐싱**: 자주 검색되는 결과를 캐시하여 성능 최적화
- 📱 **반응형 UI**: Tailwind CSS로 모든 기기에 대응하는 인터페이스
- 🐳 **완전한 Docker 배포**: 단 한 줄의 명령어로 전체 시스템 시작

---

## 🛠 기술 스택

### Backend & Infrastructure
- **Spring Boot 3.x** - REST API 서버
- **Spring Security** - JWT 기반 보안
- **Spring Data JPA** - ORM 및 데이터베이스 관리
- **MySQL** - 주 관계형 데이터베이스
- **Redis** - 캐싱 및 세션 관리

### AI/ML & LLM
- **Python 3.11** - RAG 서비스
- **FastAPI** - 경량 Python 웹 프레임워크
- **LangChain 1.x** - RAG 오케스트레이션
- **Pinecone** - 벡터 데이터베이스
- **OpenAI GPT-4** - 언어 모델
- **Sentence Transformers (multilingual-e5)** - 한글 임베딩

### Frontend
- **React 18** - UI 라이브러리
- **Redux Toolkit** - 상태 관리
- **Tailwind CSS** - 유틸리티 CSS 프레임워크
- **React Router** - 클라이언트 라우팅
- **Axios** - HTTP 클라이언트

### DevOps
- **Docker** - 컨테이너 가상화
- **Docker Compose** - 다중 서비스 오케스트레이션
- **Nginx** - 리버스 프록시

---

## 📁 프로젝트 구조

```
kitchen-recipe-rag/
├── spring-recipe-rag/              # Spring Boot 백엔드
│   ├── src/main/java/
│   │   └── com/kitchen/recipe/
│   │       ├── config/             # 보안, 캐싱 설정
│   │       ├── controller/         # REST API 엔드포인트
│   │       ├── service/            # 비즈니스 로직
│   │       ├── entity/             # JPA 엔티티
│   │       ├── repository/         # 데이터 접근 계층
│   │       ├── security/           # JWT 토큰 처리
│   │       ├── dto/                # 데이터 전송 객체
│   │       └── exception/          # 예외 처리
│   ├── src/main/resources/
│   │   └── application.yml         # 애플리케이션 설정
│   ├── pom.xml                     # Maven 의존성
│   └── Dockerfile
│
├── python-rag-service/             # Python RAG 서비스
│   ├── main.py                     # FastAPI 메인 서버
│   ├── rag_system/
│   │   ├── vector_store.py         # Pinecone 통합
│   │   ├── embedding_model.py      # 임베딩 모델
│   │   ├── korean_processor.py     # 한글 텍스트 처리
│   │   └── llm_chain.py            # LangChain RAG 체인
│   ├── requirements.txt            # Python 의존성
│   ├── .env.example
│   └── Dockerfile
│
├── react-recipe-ui/                # React 프론트엔드
│   ├── src/
│   │   ├── components/             # 재사용 가능한 컴포넌트
│   │   │   ├── Layout.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── PrivateRoute.jsx
│   │   ├── pages/                  # 페이지 컴포넌트
│   │   │   ├── Home.jsx
│   │   │   ├── Search.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── RecipeDetail.jsx
│   │   │   ├── Favorites.jsx
│   │   │   └── SearchHistory.jsx
│   │   ├── services/               # API 서비스
│   │   │   └── api.js
│   │   ├── store/                  # Redux 상태 관리
│   │   │   └── slices/
│   │   │       ├── authSlice.js
│   │   │       ├── recipeSlice.js
│   │   │       └── favoriteSlice.js
│   │   ├── styles/                 # 스타일시트
│   │   │   └── index.css
│   │   └── App.jsx
│   ├── package.json
│   ├── vite.config.js              # Vite 설정
│   ├── tailwind.config.js          # Tailwind 설정
│   ├── .env.example
│   └── Dockerfile
│
├── docker-compose.yml              # 전체 서비스 오케스트레이션
├── nginx.conf                      # Nginx 리버스 프록시
├── .env                            # 환경 변수
└── README.md
```

---

## 🚀 빠른 시작

### 사전 요구사항

- Docker & Docker Compose 설치
- OpenAI API 키 (또는 다른 LLM 프로바이더)
- Pinecone API 키 및 인덱스

### 1. 저장소 클론

```bash
git clone https://github.com/yourusername/kitchen-recipe-rag.git
cd kitchen-recipe-rag
```

### 2. 환경 변수 설정

```bash
# .env 파일 생성
cp .env.example .env

# 필수 API 키 입력
nano .env
```

필수 환경 변수:
```env
OPENAI_API_KEY=sk-...
PINECONE_API_KEY=...
JWT_SECRET=your-secret-key
```

### 3. 프로젝트 시작

```bash
# 전체 스택 시작 (원클릭 배포)
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 상태 확인
docker-compose ps
```

### 4. 애플리케이션 접근

| 서비스 | URL | 설명 |
|--------|-----|------|
| 프론트엔드 | http://localhost:3000 | React UI |
| 백엔드 API | http://localhost:8080/api | Spring Boot REST API |
| RAG 서비스 | http://localhost:8000 | Python FastAPI |
| Redis | localhost:6379 | 캐시 데이터베이스 |
| MySQL | localhost:3306 | 관계형 데이터베이스 |

---

## 📖 API 엔드포인트

### 인증 (Auth)

```bash
# 회원가입
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "홍길동"
}

# 로그인
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

# 토큰 갱신
POST /api/auth/refresh
{
  "refreshToken": "token"
}
```

### 레시피 검색 (Recipes)

```bash
# 검색
GET /api/recipes/search?query=계란&appliance=전기밥솥&limit=10

# 레시피 상세 조회
GET /api/recipes/{id}

# 가전별 레시피
GET /api/recipes/appliance/전기밥솥

# 카테고리별 레시피
GET /api/recipes/category/한식

# 검색 이력
GET /api/recipes/history
```

### 즐겨찾기 (Favorites)

```bash
# 즐겨찾기 추가
POST /api/favorites/{recipeId}

# 즐겨찾기 제거
DELETE /api/favorites/{recipeId}

# 즐겨찾기 목록
GET /api/favorites

# 특정 레시피 즐겨찾기 여부 확인
GET /api/favorites/check/{recipeId}

# 즐겨찾기 개수
GET /api/favorites/count
```

---

## 🔧 설정 및 커스터마이징

### Spring Boot 설정

`spring-recipe-rag/src/main/resources/application.yml`에서 다음을 수정할 수 있습니다:

```yaml
spring:
  datasource:
    url: jdbc:mysql://mysql:3306/recipe_db
  jpa:
    hibernate:
      ddl-auto: update
  data:
    redis:
      host: redis
      port: 6379

jwt:
  secret: "your-secret-key"
  expiration: 86400000  # 24시간
```

### Python RAG 서비스 설정

`python-rag-service/main.py`에서:

```python
# Embedding 모델 변경
embedding_model = EmbeddingModel(
    model_name="multilingual-e5-large"  # 또는 다른 모델
)

# Pinecone 설정
vector_store = PineconeVectorStore(
    api_key=os.getenv("PINECONE_API_KEY"),
    index_name="recipes"
)
```

### React 설정

`react-recipe-ui/.env`에서:

```env
VITE_API_URL=http://localhost:8080/api
```

---

## 📊 데이터베이스 스키마

### Users 테이블
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    role VARCHAR(20),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    last_login_at TIMESTAMP
);
```

### Recipes 테이블
```sql
CREATE TABLE recipes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    appliance VARCHAR(100),
    ingredients TEXT,
    instructions TEXT,
    category VARCHAR(100),
    cuisine_type VARCHAR(50),
    difficulty_level VARCHAR(20),
    prep_time INT,
    cook_time INT,
    serving_size INT,
    vectordb_id VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Favorites 테이블
```sql
CREATE TABLE favorites (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    recipe_id BIGINT NOT NULL,
    created_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (recipe_id) REFERENCES recipes(id),
    UNIQUE KEY unique_user_recipe (user_id, recipe_id)
);
```

---

## 🧪 테스트

### 로컬 개발 환경

```bash
# Spring Boot 테스트
cd spring-recipe-rag
mvn test

# Python 테스트
cd python-rag-service
pytest

# React 테스트
cd react-recipe-ui
npm test
```

### API 테스트 (curl)

```bash
# 회원가입
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456","name":"테스트"}'

# 로그인
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'

# 검색 (토큰 필요)
curl -X GET "http://localhost:8080/api/recipes/search?query=계란&limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔐 보안 고려사항

### 프로덕션 배포 시

1. **JWT 시크릿 변경**
   ```bash
   # 강력한 시크릿 생성
   openssl rand -base64 32
   ```

2. **HTTPS 활성화**
   - SSL 인증서 설정 (Let's Encrypt 권장)

3. **환경 변수 관리**
   - 민감한 정보를 `.env` 파일에서 관리
   - `.env` 파일을 버전 관리에서 제외

4. **데이터베이스 암호 변경**
   ```env
   DB_PASSWORD=strong_password_here
   ```

5. **CORS 설정 제한**
   ```yaml
   spring:
     security:
       cors:
         allowed-origins: https://yourdomain.com
   ```

6. **레이트 리미팅**
   - API 요청 제한 설정

---

## 🐛 문제 해결

### 데이터베이스 연결 실패

```bash
# MySQL 상태 확인
docker-compose logs mysql

# MySQL 재시작
docker-compose restart mysql
```

### Redis 캐시 문제

```bash
# Redis 상태 확인
docker-compose logs redis

# Redis 캐시 초기화
docker-compose exec redis redis-cli FLUSHALL
```

### Python RAG 서비스 오류

```bash
# 로그 확인
docker-compose logs python-rag-service

# 서비스 재시작
docker-compose restart python-rag-service
```

### API 인증 문제

```bash
# 토큰 유효성 확인
# Authorization 헤더에 올바른 JWT 토큰이 포함되어 있는지 확인
# 헤더 형식: Authorization: Bearer <token>
```

---

## 📚 학습 자료

### 참고 문서

- [LangChain 한글 문서](https://python.langchain.com/)
- [Spring Boot 문서](https://spring.io/projects/spring-boot)
- [React 문서](https://react.dev)
- [Pinecone 가이드](https://docs.pinecone.io/)

### 유용한 링크

- [RAG 시스템 소개](https://aws.amazon.com/what-is/retrieval-augmented-generation/)
- [LLM 최적화](https://openai.com/research/techniques-to-improve-reliability)
- [Spring Security JWT](https://www.baeldung.com/spring-security-oauth-jwt)

---

## 🤝 기여하기

기여는 언제나 환영합니다!

1. Fork 하기
2. Feature branch 생성 (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Pull Request 생성

---

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참고하세요.

---

## 📞 지원

문제가 있거나 제안이 있으시면:

- GitHub Issues에 이슈 등록
- 토론 포럼에서 질문
- 이메일: your-email@example.com

---

## 🎯 향후 계획

- [ ] 다국어 지원 확대
- [ ] 모바일 앱 개발
- [ ] 실시간 협업 기능
- [ ] 고급 필터링 옵션
- [ ] 음성 검색 기능
- [ ] 레시피 평점 및 리뷰 시스템
- [ ] 소셜 공유 기능
- [ ] 영양 정보 분석

---

**Happy Cooking! 🍳**
