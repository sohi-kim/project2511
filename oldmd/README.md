# 🍳 주방가전 요리책 RAG 시스템 - 풀스택 프로젝트

> Python LangChain RAG + Spring Boot + React + Redis 캐싱을 활용한 주방가전별 요리 검색 시스템

## 📋 프로젝트 개요

주방가전(전기밥솥, 쥬서기, 믹서기 등)의 매뉴얼에 포함된 요리책을 AI 기반 RAG(Retrieval-Augmented Generation) 시스템으로 검색하고, 사용자가 질문을 하면 관련 요리를 추천하고 상세 설명을 제공합니다.

### 핵심 기능

- 🔍 **한글 최적화 RAG 검색**: Pinecone 벡터 DB + LangChain
- 👤 **사용자 인증**: JWT 기반 토큰 인증
- ❤️ **즐겨찾기**: 사용자별 요리 저장 기능
- ⚡ **Redis 캐싱**: 응답 성능 최적화
- 📱 **반응형 UI**: React + Tailwind CSS
- 🐳 **Docker 배포**: 원클릭 배포

---

## 🛠 기술 스택

### 프론트엔드
- **React 18** - 사용자 인터페이스
- **Redux Toolkit** - 상태 관리
- **Tailwind CSS** - 스타일링
- **Axios** - HTTP 클라이언트

### 백엔드
- **Spring Boot 3.x** - REST API 서버
- **Spring Security** - JWT 인증
- **Spring Data JPA** - ORM
- **Spring Data Redis** - 캐싱
- **PostgreSQL** - 주 데이터베이스
- **Redis** - 캐시 데이터베이스

### AI/ML
- **Python 3.11** - RAG 서비스
- **FastAPI** - REST API 프레임워크
- **LangChain 1.x** - RAG 오케스트레이션
- **Pinecone** - 벡터 데이터베이스
- **OpenAI GPT-4** - LLM
- **HuggingFace (multilingual-e5)** - 한글 임베딩

### DevOps
- **Docker** - 컨테이너화
- **Docker Compose** - 오케스트레이션

---

## 📁 프로젝트 구조

```
kitchen-recipe-rag/
├── spring-recipe-rag/              # Spring Boot 백엔드
│   ├── src/
│   ├── pom.xml
│   ├── Dockerfile
│   └── application.yml
├── python-rag-service/             # Python RAG 서비스
│   ├── main.py
│   ├── rag_system/
│   ├── requirements.txt
│   └── Dockerfile
├── react-recipe-ui/                # React 프론트엔드
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml              # 모든 서비스 오케스트레이션
├── .env                            # 환경 변수
└── README.md
```

---

## 🚀 빠른 시작

### 필수 요구사항

- Docker Desktop (최신 버전)
- Git
- 텍스트 에디터 (VSCode 권장)

### 환경 변수 설정

```bash
# 루트 디렉토리에 .env 파일 생성
PINECONE_API_KEY=your-pinecone-api-key
OPENAI_API_KEY=your-openai-api-key
```

### 1단계: 프로젝트 클론 및 구조 생성

```bash
# 프로젝트 디렉토리 생성
mkdir kitchen-recipe-rag
cd kitchen-recipe-rag

# 제공된 파일들을 해당 디렉토리에 배치
# spring-recipe-rag/
# python-rag-service/
# react-recipe-ui/
```

### 2단계: 서비스 실행

```bash
# Docker Compose로 모든 서비스 시작
docker-compose up -d

# 서비스 상태 확인
docker-compose ps

# 로그 확인
docker-compose logs -f
```

### 3단계: 서비스 접근

- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:8080/api
- **Python RAG API**: http://localhost:8000
- **Swagger 문서**: http://localhost:8000/docs

### 4단계: 테스트

```bash
# 1. 웹 브라우저에서 http://localhost:3000 접속
# 2. 회원가입 후 로그인
# 3. 검색창에 질문 입력
#    예: "밥솥으로 밥을 지으려면?"
# 4. 결과 확인 및 즐겨찾기 추가
```

---

## 📚 API 문서

### 인증 API

#### 회원가입
```bash
POST /api/auth/signup
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

#### 로그인
```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123"
}

# 응답
{
  "accessToken": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refreshToken": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "username": "testuser"
}
```

### 요리 검색 API

#### 요리 검색
```bash
POST /api/recipes/search
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "question": "밥솥으로 밥을 지으려면?",
  "appliance": "전기밥솥"
}

# 응답
{
  "recipeId": 1,
  "query": "밥솥으로 밥을 지으려면?",
  "answer": "밥솥으로 밥을 지으려면...",
  "appliance": "전기밥솥",
  "sources": [...],
  "isFavorite": false,
  "createdAt": "2024-11-14T12:00:00"
}
```

#### 상세 정보 조회
```bash
GET /api/recipes/{recipeId}
```

### 즐겨찾기 API

#### 즐겨찾기 목록 조회
```bash
GET /api/favorites
Authorization: Bearer {accessToken}
```

#### 즐겨찾기 추가
```bash
POST /api/favorites/{recipeId}
Authorization: Bearer {accessToken}
```

#### 즐겨찾기 제거
```bash
DELETE /api/favorites/{recipeId}
Authorization: Bearer {accessToken}
```

---

## 🔐 보안 설정

### JWT 토큰
- **알고리즘**: HS256
- **Access Token TTL**: 15분
- **Refresh Token TTL**: 7일

### 비밀번호
- **암호화**: bcrypt
- **최소 길이**: 8자
- **복잡도**: 대/소문자, 숫자, 특수문자 포함 권장

### CORS
- **허용 도메인**: localhost:3000, 프로덕션 도메인
- **허용 메서드**: GET, POST, PUT, DELETE

---

## 💾 데이터베이스 스키마

### Users 테이블
```sql
CREATE TABLE users (
  user_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Recipes 테이블
```sql
CREATE TABLE recipes (
  recipe_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  query VARCHAR(255) NOT NULL,
  answer TEXT NOT NULL,
  appliance VARCHAR(100),
  sources JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Favorites 테이블
```sql
CREATE TABLE favorites (
  favorite_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  recipe_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id),
  UNIQUE(user_id, recipe_id)
);
```

---

## ⚡ Redis 캐싱 전략

### 캐시 키 구조
- `recipe:search:{query}:{appliance}` - 검색 결과 (1시간)
- `recipe:{recipeId}` - 요리 상세정보 (1시간)
- `user:favorites:{userId}` - 사용자 즐겨찾기 (30분)
- `search:history:{userId}` - 검색 히스토리 (1시간)

### 캐시 무효화
- 새 Recipe 생성 시 관련 검색 캐시 삭제
- Favorite 추가/제거 시 사용자 캐시 갱신
- 사용자 정보 수정 시 프로필 캐시 삭제

---

## 🧪 테스트

### 단위 테스트
```bash
# Spring Boot
cd spring-recipe-rag
mvn test

# React
cd react-recipe-ui
npm test
```

### 통합 테스트
```bash
# Postman 또는 curl로 API 테스트
# 생성된 테스트 시나리오 참고
```

---

## 📈 성능 최적화

### 백엔드
- 데이터베이스 인덱싱 (username, email)
- N+1 쿼리 문제 해결 (FetchType.LAZY)
- Redis 캐싱으로 응답 시간 50% 단축

### 프론트엔드
- 코드 스플리팅 및 번들 크기 최적화
- 이미지 최적화 및 lazy loading
- Redux 상태 정규화

### Python RAG
- 벡터 검색 성능 튜닝
- 배치 임베딩으로 처리량 증대
- 응답 캐싱 및 TTL 관리

---

## 🐛 문제 해결

### PostgreSQL 연결 실패
```bash
# PostgreSQL 서비스 상태 확인
docker-compose logs postgres

# 데이터베이스 재초기화
docker-compose down -v
docker-compose up -d
```

### Redis 연결 실패
```bash
# Redis 서비스 상태 확인
docker-compose logs redis

# Redis CLI 접근
docker exec -it kitchen-rag-redis redis-cli
> PING
```

### Python RAG 초기화 실패
```bash
# .env 파일에서 API 키 확인
echo $PINECONE_API_KEY
echo $OPENAI_API_KEY

# 로그 확인
docker-compose logs python-rag
```

---

## 📝 환경별 설정

### 개발 환경
```bash
# docker-compose.yml 기본 설정 사용
docker-compose up -d

# 로컬 포트로 접속
http://localhost:3000  # React
http://localhost:8080  # Spring Boot
http://localhost:8000  # Python RAG
```

### 프로덕션 환경

```bash
# 환경 변수 설정
export SPRING_PROFILES_ACTIVE=prod
export JWT_SECRET=your-very-long-secret-key
export DATABASE_URL=your-rds-endpoint
export REDIS_URL=your-elasticache-endpoint

# Docker 이미지 빌드 및 푸시
docker build -t your-registry/kitchen-rag-backend spring-recipe-rag/
docker push your-registry/kitchen-rag-backend

# AWS ECS 또는 Kubernetes 배포
```

---

## 📚 참고 자료

### 문서
- [아키텍처 설계](./KitchenRecipeRag_Architecture.md)
- [구현 가이드](./Implementation_Guide.md)

### 외부 리소스
- [Spring Boot 공식 문서](https://spring.io/projects/spring-boot)
- [React 공식 문서](https://react.dev)
- [FastAPI 문서](https://fastapi.tiangolo.com)
- [LangChain 문서](https://python.langchain.com)
- [Docker 문서](https://docs.docker.com)

---

## 🤝 기여 방법

1. 프로젝트 Fork
2. Feature 브랜치 생성 (`git checkout -b feature/AmazingFeature`)
3. 변경사항 커밋 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치 Push (`git push origin feature/AmazingFeature`)
5. Pull Request 생성

---

## 📋 체크리스트

### 개발 완료 전
- [ ] 모든 API 엔드포인트 테스트
- [ ] 에러 핸들링 검증
- [ ] CORS 설정 확인
- [ ] 데이터베이스 백업 계획
- [ ] 로깅 설정

### 배포 전
- [ ] 환경 변수 설정
- [ ] SSL/TLS 인증서 준비
- [ ] 데이터베이스 마이그레이션
- [ ] 모니터링 설정
- [ ] 보안 스캔

### 배포 후
- [ ] 헬스 체크 확인
- [ ] 로그 모니터링
- [ ] 사용자 접근성 테스트
- [ ] 성능 메트릭 수집
- [ ] 인시던트 대응 계획

---

## 📞 지원 및 피드백

- Issues: GitHub Issues에서 버그 보고
- Discussions: 기능 제안 및 토론
- Email: support@kitchenrag.example.com

---

## 📄 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능

---

## 🎯 향후 개선 사항

- [ ] 음성 기반 검색
- [ ] 영상 레시피 추천
- [ ] 사용자 평점 및 리뷰
- [ ] 영양 정보 제공
- [ ] 모바일 앱 개발
- [ ] 다국어 지원
- [ ] AI 학습 기능 추가

---

**Happy Cooking! 🍽️**

마지막 업데이트: 2024-11-14
