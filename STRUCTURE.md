# 🎯 Kitchen Recipe RAG System - 프로젝트 설정 가이드

## ✅ 생성된 파일 목록 (총 50+ 파일)

### Spring Boot Backend (spring-recipe-rag/)
```
✓ pom.xml                          - Maven 의존성 설정
✓ Dockerfile                       - Docker 이미지 빌드
✓ src/main/resources/application.yml - 애플리케이션 설정

Java 클래스:
✓ RecipeRagApplication.java        - 메인 애플리케이션
✓ entity/User.java                 - 사용자 엔티티
✓ entity/Recipe.java               - 레시피 엔티티
✓ entity/Favorite.java             - 즐겨찾기 엔티티
✓ entity/SearchHistory.java        - 검색 이력 엔티티
✓ repository/UserRepository.java   - 사용자 저장소
✓ repository/RecipeRepository.java - 레시피 저장소
✓ repository/FavoriteRepository.java - 즐겨찾기 저장소
✓ repository/SearchHistoryRepository.java - 검색 이력 저장소
✓ dto/AuthRequest.java             - 인증 요청 DTO
✓ dto/RecipeDto.java               - 레시피 응답 DTO
✓ security/JwtTokenProvider.java   - JWT 토큰 관리
✓ security/JwtAuthenticationFilter.java - JWT 필터
✓ config/SecurityConfig.java       - Spring Security 설정
✓ config/RedisCacheConfig.java     - Redis 캐싱 설정
✓ config/WebClientConfig.java      - WebClient 설정
✓ service/AuthService.java         - 인증 비즈니스 로직
✓ service/RecipeSearchService.java - 레시피 검색 로직
✓ service/FavoriteService.java     - 즐겨찾기 로직
✓ service/CustomUserDetailsService.java - 사용자 인증 서비스
✓ controller/AuthController.java   - 인증 API
✓ controller/RecipeController.java - 레시피 API
✓ controller/FavoriteController.java - 즐겨찾기 API
✓ exception/AppException.java      - 커스텀 예외
✓ exception/GlobalExceptionHandler.java - 전역 예외 처리
```

### Python RAG Service (python-rag-service/)
```
✓ main.py                          - FastAPI 메인 서버
✓ requirements.txt                 - Python 의존성
✓ Dockerfile                       - Docker 이미지 빌드
✓ .env.example                     - 환경 변수 예시

RAG System 모듈:
✓ rag_system/__init__.py           - 패키지 초기화
✓ rag_system/vector_store.py       - Pinecone 벡터 스토어
✓ rag_system/embedding_model.py    - 한글 임베딩 모델
✓ rag_system/korean_processor.py   - 한글 텍스트 처리
✓ rag_system/llm_chain.py          - LangChain RAG 체인
```

### React Frontend (react-recipe-ui/)
```
✓ package.json                     - 프로젝트 메타데이터 및 스크립트
✓ vite.config.js                  - Vite 번들러 설정
✓ tailwind.config.js              - Tailwind CSS 설정
✓ Dockerfile                       - Docker 이미지 빌드
✓ .env.example                     - 환경 변수 예시

React 컴포넌트:
✓ src/App.jsx                      - 메인 App 컴포넌트
✓ src/components/Layout.jsx        - 레이아웃
✓ src/components/Navbar.jsx        - 네비게이션 바
✓ src/components/PrivateRoute.jsx  - 보호된 라우트

페이지:
✓ src/pages/Home.jsx               - 홈 페이지

서비스 & 상태관리:
✓ src/services/api.js              - API 클라이언트
✓ src/store/index.js               - Redux 스토어
✓ src/store/slices/authSlice.js    - 인증 상태
✓ src/store/slices/recipeSlice.js  - 레시피 상태
✓ src/store/slices/favoriteSlice.js - 즐겨찾기 상태
```

### Docker & 배포
```
✓ docker-compose.yml               - 전체 서비스 오케스트레이션
✓ nginx.conf                       - Nginx 리버스 프록시
✓ .env                             - 환경 변수 (프로덕션용)
✓ .gitignore                       - Git 무시 설정
```

### 문서
```
✓ README.md                        - 완전한 프로젝트 가이드
✓ STRUCTURE.md                     - 이 파일
```

---

## 🚀 실행 방법

### 1단계: 환경 변수 설정

```bash
# 현재 디렉토리
cd /kitchen-recipe-rag

# .env 파일 확인 (이미 생성됨)
cat .env
```

필수 설정:
```env
OPENAI_API_KEY=sk-your-key  # OpenAI 키 입력
PINECONE_API_KEY=your-key   # Pinecone 키 입력
JWT_SECRET=change-this-key  # JWT 시크릿
```

### 2단계: Docker Compose 실행

```bash
# 모든 서비스 시작
docker-compose up -d

# 상태 확인
docker-compose ps

# 로그 확인
docker-compose logs -f
```

### 3단계: 서비스 접근

```
Frontend:  http://localhost:3000
Backend:   http://localhost:8080/api
RAG:       http://localhost:8000
```

---

## 📊 서비스 포트 매핑

| 서비스 | 포트 | 설명 |
|--------|------|------|
| React UI | 3000 | 프론트엔드 |
| Spring Boot | 8080 | REST API |
| Python RAG | 8000 | RAG 서비스 |
| MySQL | 3306 | 데이터베이스 |
| Redis | 6379 | 캐시 |
| Nginx | 80 | 리버스 프록시 |

---

## 🔑 주요 기능 구현

### ✅ 인증 시스템
- JWT 기반 토큰 인증
- Refresh 토큰 관리
- BCrypt 패스워드 암호화
- CORS 설정

### ✅ 레시피 검색
- Pinecone 벡터 데이터베이스
- multilingual-e5 한글 임베딩
- LangChain RAG 체인
- 캐싱된 검색 결과

### ✅ 사용자 기능
- 즐겨찾기 관리
- 검색 이력 추적
- 개인화된 추천

### ✅ 캐싱 & 성능
- Redis 캐싱
- @Cacheable 애노테이션
- 1시간 TTL 설정

### ✅ 에러 처리
- 전역 예외 처리
- 커스텀 에러 응답
- 상세한 로깅

---

## 📝 API 예제

### 회원가입
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "홍길동"
  }'
```

### 로그인
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### 레시피 검색
```bash
curl -X GET "http://localhost:8080/api/recipes/search?query=계란&appliance=전기밥솥" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔧 커스터마이징 포인트

### 1. 임베딩 모델 변경
`python-rag-service/rag_system/embedding_model.py`
```python
self.model = SentenceTransformer("multilingual-e5-large")
```

### 2. LLM 모델 변경
`python-rag-service/rag_system/llm_chain.py`
```python
self.llm = ChatOpenAI(model="gpt-4")
```

### 3. 캐시 TTL 조정
`spring-recipe-rag/src/main/java/com/kitchen/recipe/config/RedisCacheConfig.java`
```java
.entryTtl(Duration.ofHours(1))
```

### 4. 데이터베이스 스키마
자동 생성됨 (`ddl-auto: update`)

---

## 🧪 테스트 명령어

```bash
# Spring Boot 테스트
cd spring-recipe-rag
mvn test

# 빌드
mvn clean package

# Python 서비스 테스트
cd python-rag-service
pytest

# React 빌드
cd react-recipe-ui
npm install
npm run build
```

---

## 📦 배포 체크리스트

- [ ] `.env` 파일에서 모든 API 키 입력
- [ ] JWT_SECRET 변경
- [ ] 데이터베이스 백업 계획 수립
- [ ] HTTPS 인증서 준비
- [ ] 로드 밸런싱 설정 (필요시)
- [ ] 모니터링 설정
- [ ] 로그 수집 구성
- [ ] 백업 및 복구 계획

---

## 🆘 트러블슈팅

### Docker 빌드 오류
```bash
docker-compose build --no-cache
```

### 데이터베이스 초기화
```bash
docker-compose exec mysql mysql -u root -prootpassword recipe_db < backup.sql
```

### 캐시 초기화
```bash
docker-compose exec redis redis-cli FLUSHALL
```

### 로그 확인
```bash
docker-compose logs -f service-name
```

---

## 📚 다음 단계

1. **데이터 로드**: 요리책 매뉴얼 PDF를 벡터 데이터베이스에 인덱싱
2. **UI 완성**: 추가 페이지 개발 (Search, Favorites, History 등)
3. **성능 최적화**: 캐싱 전략 개선, 쿼리 최적화
4. **배포**: AWS, Google Cloud, Azure 등으로 배포
5. **모니터링**: Prometheus, Grafana 등으로 모니터링

---

## 📞 문제 해결

프로젝트 구성이나 실행에 문제가 있으면:

1. README.md의 트러블슈팅 섹션 확인
2. Docker 로그 확인: `docker-compose logs -f`
3. 포트 충돌 확인: `lsof -i :8080`
4. 네트워크 확인: `docker network ls`

---

**프로젝트 생성 완료! 🎉**

모든 파일이 `/kitchen-recipe-rag` 디렉토리에 생성되었습니다.
`docker-compose up -d`로 바로 시작하세요!
