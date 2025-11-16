# ⚡ 5분 안에 시작하기 (Quick Start)

## 📥 다운로드 옵션

### 옵션 1: 전체 ZIP 파일 (권장)
```
kitchen-recipe-rag-complete.zip (39KB)
```
모든 파일이 포함되어 있습니다. 이 파일을 다운로드하면 됩니다!

### 옵션 2: 개별 파일 다운로드
필요한 파일만 선택해서 다운로드하세요.

---

## 🚀 즉시 시작하기 (3단계)

### 1단계: ZIP 압축 해제
```bash
unzip kitchen-recipe-rag-complete.zip
```

### 2단계: .env 파일 생성
```bash
cat > .env << EOF
PINECONE_API_KEY=your-pinecone-api-key-here
OPENAI_API_KEY=your-openai-api-key-here
EOF
```

### 3단계: Docker 실행
```bash
docker-compose up -d
```

**완료!** 이제 다음 주소에서 접속하세요:
- 🌐 **웹사이트**: http://localhost:3000
- 📚 **API 문서**: http://localhost:8000/docs

---

## 📋 주요 파일 설명

### 📚 먼저 읽을 문서
1. **README.md** - 프로젝트 개요 (먼저 읽기!)
2. **Implementation_Guide.md** - 단계별 구현
3. **KitchenRecipeRag_Architecture.md** - 기술 상세

### 🔧 Spring Boot 설정
- **pom.xml** - Maven 의존성
- **spring-app-config.yml** - 애플리케이션 설정
- **spring-entities.java** - 데이터베이스 엔티티
- **spring-core-services.java** - 핵심 서비스 (JWT, Redis, RAG)
- **spring-repo-dto-controller.java** - API 엔드포인트

### 🐍 Python RAG
- **python-fastapi-service.py** - FastAPI 래퍼

### ⚛️ React
- **react-services-store.jsx** - API 서비스 & Redux
- **react-components.jsx** - UI 컴포넌트

### 🐳 배포
- **docker-compose.yml** - 모든 서비스 시작

---

## 🆘 문제 해결

### 포트가 이미 사용 중이라면
```bash
# 특정 포트 찾기 (예: 8080)
lsof -i :8080

# 포트 변경 (docker-compose.yml 수정)
# "8080:8080" → "8090:8080"
```

### Docker가 없다면
```bash
# Docker 설치
# macOS: brew install docker
# Windows: https://www.docker.com/products/docker-desktop
# Linux: sudo apt-get install docker.io
```

### API 키 없다면
```bash
# 1. Pinecone 가입: https://www.pinecone.io
# 2. OpenAI 가입: https://platform.openai.com
# 3. API 키를 .env 파일에 입력
```

---

## ✅ 정상 작동 확인

```bash
# 1. 서비스 상태 확인
docker-compose ps

# 2. 헬스 체크
curl http://localhost:8000/health

# 3. 브라우저에서
http://localhost:3000
```

모든 서비스가 "Up" 상태면 성공!

---

## 📊 시스템 요구사항

| 항목 | 요구사항 |
|------|---------|
| **OS** | Windows 10+, macOS 10.15+, Ubuntu 20.04+ |
| **RAM** | 최소 8GB (권장 16GB) |
| **Disk** | 최소 5GB (권장 10GB) |
| **Docker** | 최신 버전 |
| **인터넷** | 필수 (API 호출) |

---

## 🎯 주요 기능

### 사용자 관리
```
회원가입 → 로그인 → JWT 토큰 발급
```

### 요리 검색
```
질문 입력 → RAG 검색 → AI 응답 생성 → 캐싱
```

### 즐겨찾기
```
❤️ 버튼 클릭 → 데이터베이스 저장 → 프로필에 표시
```

---

## 💡 팁과 트릭

### 1. 캐시 초기화
```bash
# Redis 캐시 전체 삭제
docker exec kitchen-rag-redis redis-cli FLUSHALL
```

### 2. 로그 확인
```bash
# 특정 서비스 로그
docker-compose logs -f spring-boot

# 모든 서비스 로그
docker-compose logs -f
```

### 3. 데이터베이스 접근
```bash
# PostgreSQL 접근
docker exec -it kitchen-rag-postgres psql -U postgres -d kitchen_rag
```

### 4. Python RAG API 테스트
```bash
curl -X POST http://localhost:8000/api/rag/search \
  -H "Content-Type: application/json" \
  -d '{"question":"밥솥으로 밥을 지으려면?","appliance":"전기밥솥"}'
```

---

## 📱 테스트 계정

### 회원가입 후 로그인
```
Username: testuser
Email: test@example.com
Password: password123
```

---

## 🔗 유용한 링크

- **Docker Hub**: https://hub.docker.com
- **Spring Boot**: https://spring.io
- **React**: https://react.dev
- **FastAPI**: https://fastapi.tiangolo.com

---

## 📞 다음 단계

1. ✅ docker-compose up 실행
2. ✅ http://localhost:3000 접속
3. ✅ 회원가입 및 로그인
4. ✅ 검색 테스트
5. ✅ 즐겨찾기 기능 테스트
6. ✅ 나머지 문서 읽기 (Implementation_Guide.md)

---

## 🎉 완료!

축하합니다! 이제 완전한 풀스택 RAG 애플리케이션을 실행 중입니다!

**질문이 있으시면 README.md와 Implementation_Guide.md를 참고하세요.**

Happy Coding! 🚀
