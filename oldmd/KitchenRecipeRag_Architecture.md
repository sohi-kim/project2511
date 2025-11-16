# 주방가전 요리책 RAG 시스템 - 풀스택 프로젝트 설계서

## 프로젝트 개요
- **목표**: 전기밥솥, 쥬서기, 믹서기 등 주방가전 요리책을 RAG(Retrieval-Augmented Generation) 기반으로 검색하고 응답
- **기술 스택**: Python RAG + Spring Boot + React + Redis + PostgreSQL/MySQL
- **특징**: 한글 최적화, 사용자 인증, 즐겨찾기(좋아요), Redis 캐싱

---

## 1. 전체 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│                        React Frontend                            │
│  (요리 검색, 즐겨찾기, 사용자 프로필, 실시간 응답)              │
└────────────────────────────┬────────────────────────────────────┘
                             │ REST API
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Spring Boot Backend                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Controller (REST API)                                    │   │
│  │ - 요리 검색 API                                          │   │
│  │ - 즐겨찾기 API (좋아요/취소)                             │   │
│  │ - 사용자 프로필 API                                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                             │                                    │
│  ┌──────────────────────────▼──────────────────────────────┐   │
│  │ Service Layer                                            │   │
│  │ - 비즈니스 로직                                          │   │
│  │ - Redis 캐싱 로직                                        │   │
│  │ - Python RAG API 호출                                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                             │                                    │
│  ┌──────────────────────────▼──────────────────────────────┐   │
│  │ Repository (JPA)                                         │   │
│  │ - User, Recipe, Favorite Entity                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                             │                                    │
│  ┌──────────────────────────▼──────────────────────────────┐   │
│  │ Redis Cache (응답 캐싱)                                  │   │
│  │ - Query 결과 캐싱                                        │   │
│  │ - 사용자별 즐겨찾기 캐싱                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP Client
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Python RAG Service                             │
│  (FastAPI + LangChain + Pinecone)                               │
│  - PDF 임베딩 및 검색                                            │
│  - LLM 응답 생성                                                │
└─────────────────────────────────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
    ┌────────────┐    ┌──────────────┐    ┌─────────────┐
    │  Pinecone  │    │  OpenAI API  │    │  HuggingFace│
    │   Vector DB│    │   (GPT-4)    │    │ (임베딩)     │
    └────────────┘    └──────────────┘    └─────────────┘
        │
        ▼
    ┌──────────────────┐
    │   PostgreSQL     │
    │   (사용자,즐겨찾기) │
    └──────────────────┘
```

---

## 2. 데이터베이스 스키마

### 2.1 PostgreSQL Tables

#### User Table
```sql
CREATE TABLE users (
    user_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL (bcrypt 암호화),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### Recipe Table
```sql
CREATE TABLE recipes (
    recipe_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    query VARCHAR(255) NOT NULL,
    answer TEXT NOT NULL,
    appliance VARCHAR(100), -- 주방가전 종류 (전기밥솥, 쥬서기 등)
    sources JSON, -- RAG 검색 결과
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Favorite Table (좋아요)
```sql
CREATE TABLE favorites (
    favorite_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    recipe_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_recipe (user_id, recipe_id)
);
```

#### Search History Table
```sql
CREATE TABLE search_history (
    history_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    query VARCHAR(255) NOT NULL,
    recipe_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id) ON DELETE SET NULL
);
```

---

## 3. Spring Boot 프로젝트 구조

```
spring-recipe-rag/
├── src/main/java/com/kitchen/rag/
│   ├── KitchenRecipeRagApplication.java
│   ├── config/
│   │   ├── SecurityConfig.java              (JWT 인증)
│   │   ├── RedisConfig.java                 (Redis 캐싱)
│   │   └── RagClientConfig.java             (Python RAG 클라이언트)
│   ├── controller/
│   │   ├── RecipeController.java            (요리 검색 API)
│   │   ├── UserController.java              (사용자 관리)
│   │   └── FavoriteController.java          (즐겨찾기)
│   ├── service/
│   │   ├── RecipeService.java               (RAG 검색 로직)
│   │   ├── UserService.java                 (인증 로직)
│   │   ├── FavoriteService.java             (즐겨찾기 로직)
│   │   ├── CacheService.java                (Redis 캐싱)
│   │   └── RagClientService.java            (Python RAG 통신)
│   ├── repository/
│   │   ├── UserRepository.java
│   │   ├── RecipeRepository.java
│   │   ├── FavoriteRepository.java
│   │   └── SearchHistoryRepository.java
│   ├── entity/
│   │   ├── User.java
│   │   ├── Recipe.java
│   │   ├── Favorite.java
│   │   └── SearchHistory.java
│   ├── dto/
│   │   ├── RecipeRequestDto.java
│   │   ├── RecipeResponseDto.java
│   │   ├── UserSignUpDto.java
│   │   ├── UserLoginDto.java
│   │   └── FavoriteDto.java
│   ├── exception/
│   │   ├── GlobalExceptionHandler.java
│   │   ├── RecipeException.java
│   │   └── AuthenticationException.java
│   ├── security/
│   │   ├── JwtTokenProvider.java
│   │   ├── JwtAuthenticationFilter.java
│   │   └── CustomUserDetailsService.java
│   └── util/
│       └── ResponseUtil.java
├── src/main/resources/
│   ├── application.yml                     (설정 파일)
│   ├── application-dev.yml
│   └── application-prod.yml
└── pom.xml
```

---

## 4. React 프로젝트 구조

```
react-recipe-ui/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Header.jsx                      (네비게이션)
│   │   ├── RecipeSearch.jsx                (검색 인터페이스)
│   │   ├── RecipeResult.jsx                (결과 표시)
│   │   ├── RecipeDetail.jsx                (상세 정보)
│   │   ├── FavoriteList.jsx                (즐겨찾기 목록)
│   │   ├── UserProfile.jsx                 (사용자 프로필)
│   │   └── Auth/
│   │       ├── Login.jsx
│   │       └── SignUp.jsx
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── SearchPage.jsx
│   │   ├── FavoritePage.jsx
│   │   └── ProfilePage.jsx
│   ├── hooks/
│   │   ├── useAuth.js                      (인증 상태 관리)
│   │   └── useRecipe.js                    (요리 검색 로직)
│   ├── services/
│   │   ├── api.js                          (API 클라이언트)
│   │   ├── authService.js                  (인증 API)
│   │   ├── recipeService.js                (검색 API)
│   │   └── favoriteService.js              (즐겨찾기 API)
│   ├── store/
│   │   ├── authSlice.js                    (Redux - 인증)
│   │   ├── recipeSlice.js                  (Redux - 검색 결과)
│   │   └── store.js
│   ├── styles/
│   │   └── App.css
│   ├── App.jsx
│   └── index.js
└── package.json
```

---

## 5. Python RAG 서비스 (FastAPI)

```
python-rag-service/
├── main.py                                 (FastAPI 앱)
├── rag_system/
│   ├── __init__.py
│   ├── korPdfRag.py                        (기존 RAG 시스템)
│   ├── rag_manager.py                      (RAG 관리자)
│   └── models.py                           (Pydantic 모델)
├── api/
│   ├── __init__.py
│   └── routes.py                           (API 엔드포인트)
├── config/
│   ├── __init__.py
│   └── settings.py                         (설정)
├── services/
│   ├── __init__.py
│   ├── pinecone_service.py                 (Pinecone 관리)
│   └── embedding_service.py                (임베딩 관리)
├── requirements.txt
└── docker/
    └── Dockerfile
```

---

## 6. API 엔드포인트 정의

### 6.1 인증 API (Spring Boot)

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| POST | `/api/auth/signup` | 회원가입 | X |
| POST | `/api/auth/login` | 로그인 | X |
| POST | `/api/auth/refresh` | 토큰 갱신 | O |
| POST | `/api/auth/logout` | 로그아웃 | O |

### 6.2 요리 검색 API (Spring Boot)

| 메서드 | 경로 | 설명 | 캐싱 | 인증 |
|--------|------|------|------|------|
| POST | `/api/recipes/search` | 요리 검색 | Redis | O |
| GET | `/api/recipes/{recipeId}` | 상세 정보 | Redis | X |
| GET | `/api/recipes/history` | 검색 히스토리 | Redis | O |

### 6.3 즐겨찾기 API (Spring Boot)

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| GET | `/api/favorites` | 즐겨찾기 목록 | O |
| POST | `/api/favorites/{recipeId}` | 즐겨찾기 추가 | O |
| DELETE | `/api/favorites/{recipeId}` | 즐겨찾기 제거 | O |
| GET | `/api/favorites/check/{recipeId}` | 즐겨찾기 확인 | O |

### 6.4 사용자 API (Spring Boot)

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| GET | `/api/users/profile` | 프로필 조회 | O |
| PUT | `/api/users/profile` | 프로필 수정 | O |
| DELETE | `/api/users/{userId}` | 계정 삭제 | O |

### 6.5 RAG API (Python FastAPI)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/rag/search` | 요리 검색 |
| POST | `/api/rag/search-with-sources` | 소스 포함 검색 |
| GET | `/api/rag/health` | 헬스 체크 |

---

## 7. Redis 캐싱 전략

### 7.1 캐싱 키 구조
```
recipe:search:{query}:{appliance}  -> RecipeResponseDto JSON
recipe:{recipeId}                   -> Recipe JSON
user:favorites:{userId}             -> List<Recipe>
search:history:{userId}             -> List<SearchHistory>
```

### 7.2 캐시 만료 시간 (TTL)
- 요리 검색 결과: 1시간 (같은 질문이 자주 나올 수 있음)
- 사용자 즐겨찾기: 30분 (자주 변함)
- 검색 히스토리: 1시간
- 사용자 프로필: 24시간

### 7.3 캐시 무효화 전략
- 새로운 Recipe 생성 시: 관련 검색 캐시 무효화
- Favorite 추가/제거: 사용자별 favorite 캐시 무효화
- 사용자 정보 수정: 해당 사용자 프로필 캐시 무효화

---

## 8. 보안 전략

### 8.1 JWT 토큰
- **알고리즘**: HS256
- **Access Token 만료**: 15분
- **Refresh Token 만료**: 7일
- **저장소**: React localStorage (HTTPS만 사용)

### 8.2 비밀번호
- **암호화**: bcrypt (Spring Security)
- **최소 길이**: 8자
- **복잡도**: 대/소문자, 숫자, 특수문자 포함

### 8.3 CORS
- **허용 도메인**: localhost:3000 (개발), 프로덕션 도메인
- **허용 메서드**: GET, POST, PUT, DELETE
- **허용 헤더**: Content-Type, Authorization

---

## 9. 배포 전략

### 9.1 Docker Compose
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    ports:
      - "5432:5432"
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
  
  spring-boot:
    build: ./spring-recipe-rag
    ports:
      - "8080:8080"
    depends_on:
      - postgres
      - redis
  
  python-rag:
    build: ./python-rag-service
    ports:
      - "8000:8000"
  
  react:
    build: ./react-recipe-ui
    ports:
      - "3000:3000"
```

### 9.2 배포 환경
- **개발**: localhost, Docker Compose
- **스테이징**: AWS EC2, RDS, ElastiCache
- **프로덕션**: AWS ECS, RDS, ElastiCache, CloudFront

---

## 10. 구현 순서

1. **Step 1**: Spring Boot 프로젝트 설정 + PostgreSQL 스키마
2. **Step 2**: JWT 인증 + UserService 구현
3. **Step 3**: RecipeService + RagClientService 구현
4. **Step 4**: Redis 캐싱 구현
5. **Step 5**: FavoriteService + SearchHistoryService 구현
6. **Step 6**: React UI 컴포넌트 개발
7. **Step 7**: Spring Boot - React 통합
8. **Step 8**: Python RAG 서비스 FastAPI 래핑
9. **Step 9**: 전체 테스트 + 성능 최적화
10. **Step 10**: Docker 배포 + CI/CD 파이프라인

---

## 11. 기술 스택 상세

| 레이어 | 기술 | 버전 |
|--------|------|------|
| **Frontend** | React | 18.x |
| | Redux Toolkit | 1.9.x |
| | Axios | 1.x |
| | Tailwind CSS | 3.x |
| **Backend** | Spring Boot | 3.x |
| | Spring Security | 6.x |
| | Spring Data JPA | 3.x |
| | Spring Data Redis | 3.x |
| **Database** | PostgreSQL | 15 |
| | Redis | 7.x |
| **Python RAG** | FastAPI | 0.1x |
| | LangChain | 1.x |
| | Pinecone | latest |
| | Hugging Face | latest |
| **DevOps** | Docker | latest |
| | Docker Compose | latest |
