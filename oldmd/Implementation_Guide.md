# 주방가전 요리책 RAG 시스템 - 풀스택 구현 가이드

## 전체 구현 순서

---

## Phase 1: 프로젝트 초기 설정 (1-2시간)

### 1.1 프로젝트 디렉토리 구조 생성

```bash
# 루트 디렉토리 생성
mkdir kitchen-recipe-rag
cd kitchen-recipe-rag

# 서브 디렉토리 생성
mkdir spring-recipe-rag python-rag-service react-recipe-ui

# 각 프로젝트 디렉토리로 이동하여 기본 구조 설정
```

### 1.2 Spring Boot 프로젝트 생성

```bash
cd spring-recipe-rag

# Spring Boot 프로젝트 생성 (Spring Initializr 또는 CLI)
# pom.xml 배치 (제공된 파일 사용)
# application.yml 배치 (제공된 파일 사용)

# 프로젝트 구조
src/
├── main/
│   ├── java/com/kitchen/rag/
│   │   ├── KitchenRecipeRagApplication.java (메인 클래스)
│   │   ├── config/
│   │   │   ├── SecurityConfig.java
│   │   │   ├── RedisConfig.java
│   │   │   └── RagClientConfig.java
│   │   ├── controller/
│   │   │   ├── RecipeController.java
│   │   │   ├── AuthController.java
│   │   │   └── FavoriteController.java
│   │   ├── service/
│   │   │   ├── RecipeService.java
│   │   │   ├── UserService.java
│   │   │   ├── FavoriteService.java
│   │   │   ├── CacheService.java
│   │   │   └── RagClientService.java
│   │   ├── repository/
│   │   │   ├── UserRepository.java
│   │   │   ├── RecipeRepository.java
│   │   │   ├── FavoriteRepository.java
│   │   │   └── SearchHistoryRepository.java
│   │   ├── entity/
│   │   │   ├── User.java
│   │   │   ├── Recipe.java
│   │   │   ├── Favorite.java
│   │   │   └── SearchHistory.java
│   │   ├── dto/
│   │   │   └── (DTO 클래스들)
│   │   ├── security/
│   │   │   ├── JwtTokenProvider.java
│   │   │   ├── JwtAuthenticationFilter.java
│   │   │   └── CurrentUser.java (어노테이션)
│   │   └── exception/
│   │       └── GlobalExceptionHandler.java
│   └── resources/
│       ├── application.yml
│       ├── application-dev.yml
│       └── application-prod.yml
└── test/

# Dockerfile 생성
Dockerfile
```

### 1.3 React 프로젝트 생성

```bash
cd ../react-recipe-ui

# Create React App
npx create-react-app .

# 불필요한 파일 제거
rm -rf src/*.css src/App.test.js src/reportWebVitals.js

# package.json에 의존성 추가 (제공된 파일 참고)
npm install

# 프로젝트 구조
src/
├── components/
│   ├── RecipeSearch.jsx
│   ├── RecipeResult.jsx
│   ├── RecipeDetail.jsx
│   ├── FavoriteList.jsx
│   ├── UserProfile.jsx
│   ├── Header.jsx
│   └── Auth/
│       ├── Login.jsx
│       └── SignUp.jsx
├── pages/
│   ├── HomePage.jsx
│   ├── SearchPage.jsx
│   ├── FavoritePage.jsx
│   └── ProfilePage.jsx
├── hooks/
│   ├── useAuth.js
│   └── useRecipe.js
├── services/
│   ├── api.js
│   ├── authService.js
│   ├── recipeService.js
│   └── favoriteService.js
├── store/
│   ├── authSlice.js
│   ├── recipeSlice.js
│   └── store.js
├── styles/
│   └── App.css
├── App.jsx
└── index.js

# Dockerfile 생성
Dockerfile

# .env 파일 생성
.env
```

### 1.4 Python RAG 서비스 설정

```bash
cd ../python-rag-service

# 프로젝트 구조
main.py                    # FastAPI 메인 파일
requirements.txt           # Python 의존성

rag_system/
├── __init__.py
├── korPdfRag.py           # 기존 RAG 시스템
└── models.py              # Pydantic 모델

config/
├── __init__.py
└── settings.py

api/
├── __init__.py
└── routes.py

Dockerfile
.env
```

---

## Phase 2: Spring Boot 핵심 구현 (3-4시간)

### 2.1 Entity 클래스 구현

제공된 `spring-entities.java` 파일의 모든 클래스 구현:
- User.java
- Recipe.java  
- Favorite.java
- SearchHistory.java

```java
// User.java 예시
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;
    
    @Column(unique = true, nullable = false)
    private String username;
    
    // ... 다른 필드
}
```

### 2.2 Repository 구현

```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
}
```

### 2.3 DTO 클래스 구현

- UserSignUpDto
- UserLoginDto
- RecipeRequestDto
- RecipeResponseDto
- FavoriteDto

### 2.4 보안 설정

#### JwtTokenProvider.java 구현
- Access Token 생성
- Refresh Token 생성
- 토큰 검증

#### SecurityConfig.java
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    // Spring Security 설정
    // JWT 필터 등록
    // CORS 설정
}
```

#### CurrentUser.java (어노테이션)
```java
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
public @interface CurrentUser {
}
```

### 2.5 Redis 캐싱 설정

`RedisConfig.java` 구현:
- RedisTemplate 설정
- CacheManager 설정
- 직렬화 설정

### 2.6 Service 레이어 구현

#### UserService.java
```java
@Service
public class UserService {
    public void signUp(UserSignUpDto signUpDto) { }
    public Map<String, String> login(UserLoginDto loginDto) { }
    public String refreshAccessToken(String refreshToken) { }
}
```

#### RecipeService.java
```java
@Service
public class RecipeService {
    public RecipeResponseDto searchRecipe(String question, String appliance, String username) { }
    public RecipeResponseDto getRecipeDetail(Long recipeId) { }
    public Map<String, Object> getSearchHistory(String username, int page, int size) { }
}
```

#### FavoriteService.java
```java
@Service
public class FavoriteService {
    public List<FavoriteDto> getUserFavorites(String username) { }
    public void addFavorite(String username, Long recipeId) { }
    public void removeFavorite(String username, Long recipeId) { }
    public boolean isFavorite(String username, Long recipeId) { }
}
```

#### CacheService.java
- 캐시 저장, 조회, 삭제 메서드

#### RagClientService.java
```java
@Service
public class RagClientService {
    // Python RAG 서비스 호출
    public String searchRecipe(String query, String appliance) { }
    public RagSearchResponse searchRecipeWithSources(String query, String appliance) { }
}
```

### 2.7 Controller 구현

- RecipeController
- AuthController  
- FavoriteController

### 2.8 테스트 및 빌드

```bash
cd spring-recipe-rag

# 빌드 (테스트 포함)
mvn clean package

# 로컬 실행
mvn spring-boot:run

# Docker 이미지 빌드
docker build -t kitchen-rag-backend .
```

---

## Phase 3: Python RAG 서비스 FastAPI 래핑 (1시간)

### 3.1 FastAPI 메인 파일 작성

`main.py` 파일 구현:
- FastAPI 앱 생성
- Pydantic 모델 정의
- RAG 시스템 초기화
- API 엔드포인트 정의

### 3.2 API 엔드포인트

- `POST /api/rag/search` - 답변만 반환
- `POST /api/rag/search-with-sources` - 소스 포함
- `GET /health` - 헬스 체크

### 3.3 requirements.txt 작성

```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
python-dotenv==1.0.0
langchain==0.1.0
pinecone-client==3.0.0
sentence-transformers==2.2.2
pdfplumber==0.10.3
```

### 3.4 Docker 이미지 빌드

```bash
cd python-rag-service

docker build -t kitchen-rag-rag-service .
```

---

## Phase 4: React 프론트엔드 구현 (4-5시간)

### 4.1 상태 관리 설정

- Redux store 생성
- authSlice, recipeSlice 정의
- 커스텀 훅 (useAuth, useRecipe) 생성

### 4.2 API 서비스 작성

- api.js (axios 인스턴스 + 인터셉터)
- authService.js
- recipeService.js
- favoriteService.js

### 4.3 컴포넌트 구현

#### 인증 관련
- Login.jsx
- SignUp.jsx
- Header.jsx (네비게이션)

#### 검색 관련
- RecipeSearch.jsx (검색 폼)
- RecipeResult.jsx (검색 결과)
- RecipeDetail.jsx (상세 정보)

#### 사용자 기능
- FavoriteList.jsx (즐겨찾기)
- UserProfile.jsx (프로필)
- SearchHistory 컴포넌트

### 4.4 페이지 구성

- HomePage.jsx
- SearchPage.jsx
- FavoritePage.jsx
- ProfilePage.jsx

### 4.5 라우팅 설정

```jsx
// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/favorites" element={<FavoritePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### 4.6 스타일링

- Tailwind CSS 설정
- 반응형 디자인
- 다크 모드 고려

### 4.7 npm 스크립트

```bash
# 개발 환경 실행
npm start

# 프로덕션 빌드
npm run build

# Docker 이미지 빌드
docker build -t kitchen-rag-frontend .
```

---

## Phase 5: Docker Compose 설정 및 통합 (1시간)

### 5.1 docker-compose.yml 설정

- PostgreSQL 서비스
- Redis 서비스
- Spring Boot 서비스
- Python RAG 서비스
- React 서비스

### 5.2 환경 변수 설정

```bash
# .env 파일 생성
PINECONE_API_KEY=your-key
OPENAI_API_KEY=your-key
```

### 5.3 서비스 시작

```bash
# 모든 서비스 시작
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 서비스 상태 확인
docker-compose ps

# 특정 서비스 로그
docker-compose logs -f spring-boot
docker-compose logs -f python-rag
docker-compose logs -f react
```

### 5.4 헬스 체크

```bash
# Spring Boot API 상태
curl http://localhost:8080/api/health

# Python RAG 서비스 상태
curl http://localhost:8000/health

# React 확인
curl http://localhost:3000
```

---

## Phase 6: 통합 테스트 및 최적화 (2-3시간)

### 6.1 API 테스트

```bash
# 회원가입
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# 로그인
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'

# 요리 검색
curl -X POST http://localhost:8080/api/recipes/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -d '{"question":"밥솥으로 밥을 지으려면?","appliance":"전기밥솥"}'
```

### 6.2 성능 최적화

#### Spring Boot
- 데이터베이스 인덱싱
- 쿼리 최적화
- Redis 캐싱 TTL 조정
- 커넥션 풀 크기 조정

#### Python RAG
- LLM 응답 시간 모니터링
- 벡터 검색 성능 최적화
- 임베딩 캐싱

#### React
- 번들 크기 최적화
- 라이브러리 코드 스플리팅
- 이미지 최적화

### 6.3 에러 처리 강화

- 글로벌 예외 처리기
- 사용자 친화적 에러 메시지
- 로깅 및 모니터링

### 6.4 보안 점검

- HTTPS 설정
- CORS 정책 검토
- 비밀번호 암호화
- JWT 토큰 만료 시간 검증
- SQL 인젝션 방지

---

## Phase 7: 배포 및 모니터링 (진행 중)

### 7.1 배포 전 체크리스트

- [ ] 모든 환경 변수 설정
- [ ] 데이터베이스 마이그레이션 완료
- [ ] TLS/SSL 인증서 설정
- [ ] 로그 중앙화 설정
- [ ] 모니터링 대시보드 구성

### 7.2 AWS 배포 (예시)

```bash
# ECR에 이미지 푸시
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

docker tag kitchen-rag-backend:latest \
  ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/kitchen-rag-backend:latest

docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/kitchen-rag-backend:latest

# ECS에 배포
# CloudFormation 또는 AWS Management Console 사용
```

### 7.3 모니터링

- Spring Boot Actuator (메트릭)
- Prometheus + Grafana
- ELK Stack (로깅)
- 알림 설정

---

## 주의사항 및 팁

### 개발 중

1. **로컬 개발 환경**
   - Docker Desktop 설치 필수
   - .env 파일에 민감한 정보 저장
   - git에 .env 파일 커밋하지 않기

2. **데이터베이스**
   - 로컬 개발 시 PostgreSQL 용량 충분한지 확인
   - 초기 마이그레이션 스크립트 준비

3. **API 테스트**
   - Postman 또는 Insomnia 사용
   - 모든 엔드포인트 테스트 케이스 작성

4. **Redis**
   - 캐시 만료 시간 적절히 설정
   - 메모리 사용량 모니터링

### 배포 후

1. **성능 모니터링**
   - API 응답 시간 추적
   - 데이터베이스 쿼리 성능
   - 캐시 히트율 모니터링

2. **에러 로깅**
   - 모든 예외 기록
   - 사용자 행동 로깅
   - 성능 저하 알림

3. **보안**
   - 정기적인 보안 패치
   - 의존성 버전 업데이트
   - 침투 테스트

---

## 예상 소요 시간 요약

| Phase | 항목 | 소요 시간 |
|-------|------|---------|
| 1 | 프로젝트 초기 설정 | 1-2시간 |
| 2 | Spring Boot 구현 | 3-4시간 |
| 3 | Python FastAPI | 1시간 |
| 4 | React 프론트엔드 | 4-5시간 |
| 5 | Docker Compose | 1시간 |
| 6 | 테스트 및 최적화 | 2-3시간 |
| **총** | | **12-16시간** |

---

## 리소스 및 참고자료

### Spring Boot
- [Spring Boot 공식 문서](https://spring.io/projects/spring-boot)
- [Spring Security JWT](https://www.toptal.com/spring/spring-security-oauth-jwt-me)
- [Redis with Spring Boot](https://spring.io/projects/spring-data-redis)

### React
- [React 공식 문서](https://react.dev)
- [Redux Toolkit](https://redux-toolkit.js.org)
- [Tailwind CSS](https://tailwindcss.com)

### Python
- [FastAPI](https://fastapi.tiangolo.com)
- [LangChain](https://python.langchain.com)

### Docker
- [Docker Documentation](https://docs.docker.com)
- [Docker Compose](https://docs.docker.com/compose)

---

마지막으로 질문이나 문제가 생기면 상담하세요!
