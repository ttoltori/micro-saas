# World VS — 국가 비교 & 퀴즈 웹 서비스

세계 국가를 비교하고 퀴즈로 학습하는 웹 서비스입니다. 국가 통계 지표를 게이지로 시각화하고, 10문항 퀴즈 후 리더보드에 점수를 등록할 수 있습니다.

## 기술 스택

- **언어**: TypeScript
- **프론트엔드**: Next.js 15 (App Router), React 19, Tailwind CSS
- **백엔드**: Hono, Node.js
- **데이터베이스**: Supabase PostgreSQL
- **패키지 관리**: pnpm workspace (모노레포)
- **검증**: Zod

## 모노레포 구조

```
root/
├─ apps/
│  ├─ worldvs-web/      # Next.js 프론트엔드 (port 3000)
│  └─ worldvs-api/      # Hono 백엔드 API (port 3001)
├─ packages/
│  ├─ database/          # PostgreSQL 연결 라이브러리
│  ├─ api-client-core/   # 공통 HTTP Client
│  ├─ worldvs-api-client/ # World VS API 호출 함수
│  └─ api-contracts/
│     └─ worldvs/        # Zod 스키마 및 타입 정의
├─ database/
│  ├─ migrations/worldvs/ # SQL 마이그레이션
│  └─ seeds/              # 초기 데이터
├─ pnpm-workspace.yaml
└─ package.json
```

## 사전 준비

1. **Node.js** 22+ 설치
2. **pnpm** 설치: `npm install -g pnpm`
3. **Supabase 프로젝트** 생성 후 다음 정보 확보:
   - Database URL (PostgreSQL connection string)
   - Anon Key (공개 API 키)

## 설치

```bash
# 저장소 클론 후
pnpm install
```

## 환경 변수 설정

### `apps/worldvs-api/.env`

```env
DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
PORT=3001
```

### `apps/worldvs-web/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 데이터베이스 마이그레이션 및 시드

```bash
# 마이그레이션 실행
pnpm db:migrate

# 초기 데이터 삽입 (국가, 지표, 국가별 지표 값, 퀴즈 문항)
pnpm db:seed
```

## 로컬 실행

```bash
# 백엔드와 프론트엔드 동시 실행
pnpm dev

# 또는 개별 실행
pnpm dev:api    # 백엔드 (port 3001)
pnpm dev:web    # 프론트엔드 (port 3000)
```

## 주요 기능

### 국가 비교
- 두 국가를 선택하여 다양한 지표(GDP, 인구, 면적 등)를 게이지로 시각화 비교
- 승/패/무승부 요약 및 배지 제공
- 인기 비교 조회 및 데일리 비교 기능

### 퀴즈
- 10문항 일일 퀴즈
- 국가, 지표, 통계 관련 문제
- 정답 확인 및 해설 제공
- 점수, 정확도, 소요 시간 측정

### 리더보드
- 상위 100명 점수 랭킹
- 닉네임, 국적, 점수, 정답 수, 소요 시간 표시
- 퀴즈 결과 후 점수 등록

## API 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| GET | `/v1/countries` | 국가 목록 조회 |
| GET | `/v1/countries/:code` | 국가 상세 조회 |
| GET | `/v1/countries/:code/recommendations` | 추천 비교 국가 |
| GET | `/v1/indicators` | 지표 목록 조회 |
| GET | `/v1/compare/:leftCode/:rightCode` | 국가 비교 결과 |
| GET | `/v1/compare/trending` | 인기 비교 조회 |
| GET | `/v1/compare/daily` | 데일리 비교 |
| POST | `/v1/quiz/sessions` | 퀴즈 세션 생성 |
| GET | `/v1/quiz/sessions/:sessionId` | 퀴즈 세션 조회 |
| POST | `/v1/quiz/sessions/:sessionId/submit` | 퀴즈 답안 제출 |
| GET | `/v1/quiz/results/:resultId` | 퀴즈 결과 조회 |
| GET | `/v1/leaderboard` | 리더보드 상위 조회 |
| GET | `/v1/leaderboard/eligibility` | 리더보드 등록 가능 여부 |
| POST | `/v1/leaderboard/submit` | 리더보드 점수 등록 |

## 빌드

```bash
pnpm build
```
