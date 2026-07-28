# World VS — API 명세서

> `apps/worldvs-api` (Hono 기반 백엔드)에서 제공하는 모든 REST API 엔드포인트에 대한 명세서.
> 모든 응답은 JSON 형식이며, 공통 응답 래퍼 구조를 사용한다.

---

## 1. 공통 사항

### 1-1. Base URL

```
http://localhost:3001        # 로컬 개발
https://<api-domain>         # 프로덕션 (Vercel)
```

### 1-2. 공통 응답 구조

#### 성공 응답

```json
{
  "success": true,
  "data": { ... },
  "meta": { "requestId": "uuid-string" }
}
```

#### 페이지네이션 응답 (일부 목록 API)

```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "total": 195,
    "page": 1,
    "pageSize": 30
  },
  "meta": { "requestId": "uuid-string" }
}
```

#### 에러 응답

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "사용자 친화적 메시지",
    "details": null
  },
  "meta": { "requestId": "uuid-string" }
}
```

### 1-3. 에러 코드

| 코드 | HTTP Status | 설명 |
|---|---|---|
| `COUNTRY_NOT_FOUND` | 404 | 국가를 찾을 수 없음 |
| `INDICATOR_NOT_FOUND` | 404 | 지표를 찾을 수 없음 |
| `QUIZ_SESSION_NOT_FOUND` | 404 | 퀴즈 세션을 찾을 수 없음 |
| `QUIZ_SESSION_ALREADY_SUBMITTED` | 400 | 이미 제출된 퀴즈 세션 |
| `QUIZ_RESULT_NOT_FOUND` | 404 | 퀴즈 결과를 찾을 수 없음 |
| `LEADERBOARD_NOT_ELIGIBLE` | 400 | 리더보드 등록 기준 미달 |
| `INVALID_PLAYER_NAME` | 400 | 닉네임 형식 오류 (2~20자 위반) |
| `VALIDATION_ERROR` | 400 | 입력값 검증 실패 |
| `INTERNAL_ERROR` | 500 | 서버 내부 오류 |

### 1-4. 인증

MVP 단계에서는 인증을 사용하지 않는다. 모든 API는 익명 접근 가능하다.

---

## 2. Health

### `GET /health`

서버 상태를 확인한다.

**응답**

```json
{
  "status": "ok"
}
```

> 공통 응답 래퍼를 사용하지 않는 단순 엔드포인트다.

---

## 3. Countries (국가)

### 3-1. `GET /v1/countries`

국가 목록을 조회한다.

**Query Parameters**

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|---|---|---|---|---|
| `region` | string | 아니오 | - | 지역 필터 (예: `Asia`, `Europe`) |
| `q` | string | 아니오 | - | 국가명 검색어 |
| `page` | number | 아니오 | `1` | 페이지 번호 |
| `pageSize` | number | 아니오 | `30` | 페이지당 항목 수 |

**응답 데이터 (`data`)**

```jsonc
{
  "items": [
    {
      "code": "KR",
      "iso3": "KOR",
      "nameKo": "대한민국",
      "nameEn": "South Korea",
      "nameJa": "韓国",
      "flagEmoji": "🇰🇷",
      "capitalKo": "서울",
      "capitalEn": "Seoul",
      "region": "Asia",
      "subregion": "Eastern Asia"
    }
  ],
  "total": 195,
  "page": 1,
  "pageSize": 30
}
```

---

### 3-2. `GET /v1/countries/:code`

국가 코드로 단일 국가 정보를 조회한다.

**Path Parameters**

| 파라미터 | 타입 | 설명 |
|---|---|---|
| `code` | string | ISO 2자리 국가 코드 (예: `KR`) |

**응답 데이터 (`data`)**

```json
{
  "code": "KR",
  "iso3": "KOR",
  "nameKo": "대한민국",
  "nameEn": "South Korea",
  "nameJa": "韓国",
  "flagEmoji": "🇰🇷",
  "capitalKo": "서울",
  "capitalEn": "Seoul",
  "region": "Asia",
  "subregion": "Eastern Asia"
}
```

**에러**

| 코드 | 조건 |
|---|---|
| `COUNTRY_NOT_FOUND` | 존재하지 않는 국가 코드 |

---

### 3-3. `GET /v1/countries/:code/recommendations`

특정 국가에 대한 추천 비교 대상 국가 목록을 조회한다.

**Path Parameters**

| 파라미터 | 타입 | 설명 |
|---|---|---|
| `code` | string | ISO 2자리 국가 코드 |

**응답 데이터 (`data`)**

추천 국가 배열 (Country 객체 배열). 동일 지역 또는 인접 국가 등 기준으로 선별된다.

```json
[
  { "code": "JP", "iso3": "JPN", "nameKo": "일본", ... },
  { "code": "CN", "iso3": "CHN", "nameKo": "중국", ... }
]
```

**에러**

| 코드 | 조건 |
|---|---|
| `COUNTRY_NOT_FOUND` | 존재하지 않는 국가 코드 |

---

## 4. Indicators (지표)

### 4-1. `GET /v1/indicators`

지표 목록을 조회한다.

**Query Parameters**

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|---|---|---|---|---|
| `category` | string | 아니오 | - | 카테고리 필터 (예: `ECONOMY`, `POPULATION`) |
| `mvp` | boolean | 아니오 | - | `true` 시 MVP 지표만 조회 |

**응답 데이터 (`data`)**

지표 배열:

```jsonc
[
  {
    "id": "gdp",
    "category": "ECONOMY",
    "nameKo": "GDP",
    "nameEn": "GDP",
    "unit": "USD",
    "descriptionKo": "국내총생산",
    "sourceName": "World Bank",
    "sourceUrl": "https://...",
    "higherIsBetter": true,
    "displayType": "MONEY",
    "decimalPlaces": 0,
    "isMvp": true,
    "sortOrder": 1
  }
]
```

---

## 5. Compare (국가 비교)

### 5-1. `GET /v1/compare/:leftCode/:rightCode`

두 국가를 비교한 결과를 조회한다. 조회 시 조회수가 로깅된다.

**Path Parameters**

| 파라미터 | 타입 | 설명 |
|---|---|---|
| `leftCode` | string | 좌측 국가 코드 (예: `KR`) |
| `rightCode` | string | 우측 국가 코드 (예: `JP`) |

**응답 데이터 (`data`)**

```jsonc
{
  "leftCountry": { "code": "KR", ... },
  "rightCountry": { "code": "JP", ... },
  "results": [
    {
      "indicator": { "id": "gdp", ... },
      "leftValue": { "value": 1693000000000, "textValue": null, "year": 2023, "sourceName": "World Bank" },
      "rightValue": { "value": 4213000000000, "textValue": null, "year": 2023, "sourceName": "World Bank" },
      "leftGauge": 28.6,
      "rightGauge": 71.4,
      "winner": "RIGHT",
      "summaryText": "일본이 GDP에서 승리합니다."
    }
  ],
  "scoreSummary": {
    "leftWins": 3,
    "rightWins": 5,
    "draws": 2,
    "unknowns": 0,
    "summaryText": "일본이 5개 지표에서 승리"
  },
  "badges": {
    "left": [{ "emoji": "🏆", "label": "인구 1위" }],
    "right": [{ "emoji": "💰", "label": "GDP 1위" }]
  }
}
```

**에러**

| 코드 | 조건 |
|---|---|
| `COUNTRY_NOT_FOUND` | 존재하지 않는 국가 코드 |
| `INTERNAL_ERROR` | 기타 서버 오류 |

---

### 5-2. `GET /v1/compare/trending`

가장 많이 조회된 국가 비교 조합을 조회한다.

**Query Parameters**

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|---|---|---|---|---|
| `limit` | number | 아니오 | `10` | 조회할 항목 수 |

**응답 데이터 (`data`)**

```jsonc
[
  {
    "leftCountryCode": "KR",
    "rightCountryCode": "JP",
    "leftCountryName": "대한민국",
    "rightCountryName": "일본",
    "leftFlagEmoji": "🇰🇷",
    "rightFlagEmoji": "🇯🇵",
    "viewCount": 1234
  }
]
```

---

### 5-3. `GET /v1/compare/daily`

오늘의 데일리 비교 조합을 조회한다.

**응답 데이터 (`data`)**

```json
{
  "leftCountryCode": "US",
  "rightCountryCode": "CN",
  "leftCountryName": "미국",
  "rightCountryName": "중국",
  "leftFlagEmoji": "🇺🇸",
  "rightFlagEmoji": "🇨🇳",
  "theme": "경제 대국 대결"
}
```

---

## 6. Quiz (퀴즈)

### 6-1. `POST /v1/quiz/sessions`

새 퀴즈 세션을 생성한다. 10문항이 무작위로 선택되어 반환된다.

**Request Body**

```jsonc
{
  "mode": "DAILY_10",       // 선택, 기본값 "DAILY_10"
  "category": null,         // 선택, 특정 카테고리 필터
  "difficulty": null        // 선택, 난이도 필터
}
```

**응답 데이터 (`data`, HTTP 201)**

```jsonc
{
  "sessionId": "uuid-string",
  "questions": [
    {
      "id": "q-001",
      "type": "COMPARE",
      "difficulty": "EASY",
      "category": "ECONOMY",
      "questionText": "다음 중 GDP가 더 높은 국가는?",
      "options": [
        { "id": "opt-a", "text": "대한민국" },
        { "id": "opt-b", "text": "일본" }
      ],
      "relatedIndicatorId": "gdp"
    }
  ]
}
```

> 정답(`correctOptionId`)과 해설(`explanation`)은 세션 조회/제출 시에는 반환되지 않는다.

---

### 6-2. `GET /v1/quiz/sessions/:sessionId`

기존 퀴즈 세션을 조회한다. 클라이언트가 세션을 재개할 때 사용한다.

**Path Parameters**

| 파라미터 | 타입 | 설명 |
|---|---|---|
| `sessionId` | string | 세션 UUID |

**응답 데이터 (`data`)**

`POST /v1/quiz/sessions` 응답과 동일한 구조 (`sessionId`, `questions`).

**에러**

| 코드 | 조건 |
|---|---|
| `QUIZ_SESSION_NOT_FOUND` | 존재하지 않는 세션 ID |

---

### 6-3. `POST /v1/quiz/sessions/:sessionId/submit`

퀴즈 답안을 제출하고 채점 결과를 반환한다.

**Path Parameters**

| 파라미터 | 타입 | 설명 |
|---|---|---|
| `sessionId` | string | 세션 UUID |

**Request Body**

```jsonc
{
  "answers": [
    {
      "questionId": "q-001",
      "selectedOptionId": "opt-b",
      "durationMs": 5200    // 선택, 문항별 소요 시간 (ms)
    }
  ],
  "totalDurationSeconds": 120
}
```

**응답 데이터 (`data`, HTTP 201)**

```jsonc
{
  "resultId": "uuid-string",
  "score": 80,
  "correctCount": 8,
  "totalQuestions": 10,
  "durationSeconds": 120,
  "title": "백과사전",
  "titleEmoji": "📚",
  "details": [
    {
      "questionId": "q-001",
      "selectedOptionId": "opt-b",
      "correctOptionId": "opt-b",
      "isCorrect": true,
      "explanation": "일본의 GDP가 대한민국보다 높습니다."
    }
  ],
  "leaderboardEligible": true
}
```

**에러**

| 코드 | 조건 |
|---|---|
| `VALIDATION_ERROR` | `answers` 배열 누락 또는 빈 배열, `totalDurationSeconds` 누락 |
| `QUIZ_SESSION_NOT_FOUND` | 존재하지 않는 세션 ID |
| `QUIZ_SESSION_ALREADY_SUBMITTED` | 이미 제출된 세션 |

---

### 6-4. `GET /v1/quiz/results/:resultId`

퀴즈 결과를 조회한다. 제출 후 결과 페이지 렌더링 또는 공유 시 사용한다.

**Path Parameters**

| 파라미터 | 타입 | 설명 |
|---|---|---|
| `resultId` | string | 결과 UUID |

**응답 데이터 (`data`)**

`POST /submit` 응답과 동일한 구조 (`resultId`, `score`, `correctCount`, `details` 등).

**에러**

| 코드 | 조건 |
|---|---|
| `QUIZ_RESULT_NOT_FOUND` | 존재하지 않는 결과 ID |

---

## 7. Leaderboard (리더보드)

### 7-1. `GET /v1/leaderboard`

리더보드 상위 순위를 조회한다.

**Query Parameters**

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|---|---|---|---|---|
| `limit` | number | 아니오 | `100` | 조회할 항목 수 (최대 100) |

**응답 데이터 (`data`)**

```jsonc
[
  {
    "rank": 1,
    "playerName": "세계왕",
    "nationalityCode": "KR",
    "nationalityName": "대한민국",
    "nationalityFlagEmoji": "🇰🇷",
    "score": 100,
    "correctCount": 10,
    "totalQuestions": 10,
    "durationSeconds": 45,
    "quizMode": "DAILY_10",
    "createdAt": "2025-07-28T10:30:00Z"
  }
]
```

---

### 7-2. `GET /v1/leaderboard/eligibility`

특정 점수로 리더보드 등록이 가능한지 확인한다.

**Query Parameters**

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|---|---|---|---|---|
| `score` | number | 아니오 | `0` | 획득 점수 |
| `durationSeconds` | number | 아니오 | `0` | 퀴즈 소요 시간(초) |

**응답 데이터 (`data`)**

```jsonc
{
  "eligible": true,
  "currentMinScore": 60,
  "currentMinDurationSeconds": 30,
  "totalEntries": 87
}
```

---

### 7-3. `POST /v1/leaderboard/submit`

퀴즈 결과를 리더보드에 등록한다.

**Request Body**

```jsonc
{
  "resultId": "uuid-string",         // 필수, 퀴즈 결과 ID
  "playerName": "세계왕",             // 필수, 2~20자
  "nationalityCode": "KR",           // 필수, 2자리 국가 코드
  "deviceId": "device-uuid"          // 선택, 중복 등록 방지용
}
```

**응답 데이터 (`data`, HTTP 201)**

등록된 리더보드 항목 정보 (rank 등 포함).

**에러**

| 코드 | 조건 |
|---|---|
| `VALIDATION_ERROR` | `resultId` 누락, `nationalityCode` 형식 오류 |
| `INVALID_PLAYER_NAME` | 닉네임 길이 2~20자 위반 |
| `QUIZ_RESULT_NOT_FOUND` | 존재하지 않는 퀴즈 결과 ID |
| `INTERNAL_ERROR` | 기타 서버 오류 |

---

## 8. 엔드포인트 요약

| Method | Path | 설명 | 응답 코드 |
|---|---|---|---|
| GET | `/health` | 서버 상태 확인 | 200 |
| GET | `/v1/countries` | 국가 목록 조회 (페이지네이션) | 200 |
| GET | `/v1/countries/:code` | 국가 상세 조회 | 200, 404 |
| GET | `/v1/countries/:code/recommendations` | 추천 비교 국가 | 200, 404 |
| GET | `/v1/indicators` | 지표 목록 조회 | 200 |
| GET | `/v1/compare/:leftCode/:rightCode` | 국가 비교 결과 | 200, 404, 500 |
| GET | `/v1/compare/trending` | 인기 비교 조합 | 200 |
| GET | `/v1/compare/daily` | 데일리 비교 | 200 |
| POST | `/v1/quiz/sessions` | 퀴즈 세션 생성 | 201, 500 |
| GET | `/v1/quiz/sessions/:sessionId` | 퀴즈 세션 조회 | 200, 404 |
| POST | `/v1/quiz/sessions/:sessionId/submit` | 퀴즈 답안 제출 | 201, 400, 404 |
| GET | `/v1/quiz/results/:resultId` | 퀴즈 결과 조회 | 200, 404 |
| GET | `/v1/leaderboard` | 리더보드 조회 | 200 |
| GET | `/v1/leaderboard/eligibility` | 등록 가능 여부 확인 | 200 |
| POST | `/v1/leaderboard/submit` | 리더보드 점수 등록 | 201, 400, 404 |
