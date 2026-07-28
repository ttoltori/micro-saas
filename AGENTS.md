# AGENTS.md

## 1. 프로젝트 목표

이 프로젝트는 여러 개의 웹서비스를 빠르게 MVP로 출시하고, 반응이 있는 서비스는 지속적으로 확장하는 것을 목표로 한다.

모든 서비스는 다음 원칙을 따른다.

- 프론트엔드와 백엔드 API를 분리한다.
- 백엔드 비즈니스 로직은 Vercel에서 실행한다.
- Supabase는 PostgreSQL 데이터베이스 중심으로 사용한다.
- 서비스별 데이터 경계는 PostgreSQL Schema로 구분한다.
- 여러 서비스에서 반복되는 기능은 공통 라이브러리로 제공한다.
- 특정 배포 플랫폼이나 CI 도구에 핵심 코드가 종속되지 않게 한다.
- 프레임워크와 추상화를 최소화하여 소스코드의 가독성과 유지보수성을 우선한다.
- 프론트엔드는 반응형 웹으로 개발한다.

---

## 2. 기본 기술 스택

### 공통

- 언어: TypeScript
- 패키지 관리자: pnpm
- 저장소 구조: pnpm workspace 기반 모노레포
- 배포: Vercel
- 데이터베이스: Supabase PostgreSQL
- 버전 관리: Git

### 프론트엔드

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- 필요한 경우에만 shadcn/ui 사용
- 서버 데이터 요청은 공통 API Client를 통해 수행

### 백엔드 API

- Hono
- TypeScript
- REST API
- SQL 직접 작성
- PostgreSQL Driver 사용
- 입력값 검증은 Zod 사용
- OpenAPI는 외부 공개 또는 모바일 앱 연동이 필요한 API부터 적용

### 모바일 확장

모바일 앱은 향후 React Native 또는 Expo를 우선 검토한다.

웹과 모바일은 동일한 REST API를 사용한다.

---

## 3. 모노레포 기본 구조

```text
root/
├─ apps/
│  ├─ service-a-web/
│  ├─ service-a-api/
│  ├─ service-b-web/
│  └─ service-b-api/
│
├─ packages/
│  ├─ backend-core/
│  ├─ auth/
│  ├─ database/
│  ├─ file-storage/
│  ├─ llm/
│  ├─ payment/
│  ├─ email/
│  ├─ notification/
│  ├─ logging/
│  ├─ batch/
│  ├─ api-client/
│  ├─ shared-types/
│  └─ config/
│
├─ database/
│  ├─ migrations/
│  ├─ seeds/
│  └─ sql/
│
├─ package.json
├─ pnpm-workspace.yaml
└─ tsconfig.base.json
```

각 서비스는 독립적으로 빌드하고 배포할 수 있어야 한다.

공통 기능은 `packages`에 두고 각 서비스가 workspace dependency로 참조한다.

---


## 3-1. 향후 모바일 앱 프로젝트 구조

모바일 앱은 웹서비스 프로젝트와 별도의 애플리케이션으로 생성한다.

예시:

```text
root/
├─ apps/
│  ├─ service-a-web/
│  ├─ service-a-api/
│  ├─ service-b-web/
│  ├─ service-b-api/
│  ├─ service-a-mobile/
│  └─ integrated-mobile/
```

모바일 앱 구성은 서비스 특성에 따라 다음 중 하나를 선택한다.

- 서비스별 독립 모바일 앱: `service-a-mobile`
- 여러 서비스를 하나의 앱에서 제공하는 통합 모바일 앱: `integrated-mobile`
- 모바일 앱을 별도 저장소로 분리하더라도 동일한 API 계약과 생성된 API Client를 사용

모바일 프로젝트는 데이터베이스, Supabase 업무 테이블, 백엔드 내부 SQL에 직접 의존하지 않는다.

```text
Mobile App
    ↓
서비스별 REST API
    ↓
Vercel Backend
    ↓
Supabase PostgreSQL
```

모바일 앱은 웹 프론트엔드와 동일한 공개 API를 사용한다.

웹 전용 API와 모바일 전용 API를 별도로 중복 구현하지 않는다.

플랫폼 차이가 있는 경우에도 동일한 Use Case를 유지하고, 요청 또는 응답 표현만 필요한 범위에서 확장한다.

---

## 3-2. 서비스별 API 계약과 공통 API Client 구조

각 서비스 API는 다른 클라이언트가 독립적으로 사용할 수 있는 명확한 API 계약을 제공해야 한다.

```text
packages/
├─ api-contracts/
│  ├─ service-a/
│  ├─ service-b/
│  └─ common/
├─ api-client-core/
├─ service-a-api-client/
└─ service-b-api-client/
```

각 패키지의 역할은 다음과 같다.

### `api-contracts`

서비스별 API의 요청, 응답, 오류 코드, 공통 타입을 정의한다.

포함 가능한 항목:

- API Request Schema
- API Response Schema
- Pagination 타입
- 공통 오류 타입
- 오류 코드
- 인증 관련 공개 타입
- OpenAPI 문서 생성에 필요한 Schema

백엔드 내부 DB Row 타입이나 SQL 결과 타입은 포함하지 않는다.

### `api-client-core`

모든 서비스 Client가 공통으로 사용하는 HTTP 기능을 제공한다.

포함 가능한 항목:

- Base URL 설정
- Access Token 전달
- Request ID 전달
- Timeout
- AbortSignal
- 공통 응답 Parsing
- 공통 오류 변환
- 인증 만료 처리 Hook
- 재시도 가능한 네트워크 오류 판별

서비스별 Endpoint는 포함하지 않는다.

### `service-a-api-client`

Service A의 공개 API 호출 함수만 제공한다.

예시:

```typescript
const serviceAClient = createServiceAClient({
  baseUrl: config.serviceAApiUrl,
  getAccessToken,
});

const bookmarks = await serviceAClient.bookmarks.list({
  page: 1,
  pageSize: 20,
});
```

웹과 모바일은 동일한 서비스별 API Client를 사용한다.

```text
service-a-web
    └─ service-a-api-client 참조

service-a-mobile
    └─ service-a-api-client 참조

integrated-mobile
    ├─ service-a-api-client 참조
    └─ service-b-api-client 참조
```

API Client는 React, Next.js, React Native에 의존하지 않는 순수 TypeScript 패키지로 작성한다.

UI 상태 관리, 화면 이동, 알림 표시 등은 API Client에 넣지 않는다.

---

## 3-3. API Client 배포와 참조 방식

모바일 앱이 같은 모노레포에 있으면 pnpm workspace dependency로 참조한다.

```json
{
  "dependencies": {
    "@platform/service-a-api-client": "workspace:*"
  }
}
```

모바일 앱이 별도 저장소로 분리되면 다음 중 하나를 사용한다.

- 사설 npm Registry에 API Client 패키지 배포
- Git Tag 기반 패키지 참조
- OpenAPI 문서에서 API Client 재생성

모바일 앱이 백엔드 소스코드 전체를 참조하게 하지 않는다.

모바일 앱이 참조할 수 있는 대상은 다음으로 제한한다.

- 서비스별 API Client
- 공개 API 계약
- 공통 오류 타입
- 순수 TypeScript Utility
- 공개 도메인 상수

다음 항목은 모바일 앱에서 참조하지 않는다.

- SQL
- DB 연결 코드
- Migration
- 서버 환경변수
- Secret
- Vercel Adapter
- Supabase Secret Key
- 백엔드 내부 구현 타입

---

## 3-4. OpenAPI와 API Client 생성 원칙

모바일 앱 또는 외부 클라이언트에서 사용할 API는 OpenAPI 문서를 제공한다.

OpenAPI 문서는 백엔드 API 계약과 일치해야 한다.

권장 흐름:

```text
Zod 기반 API Schema
    ↓
OpenAPI 문서 생성
    ↓
TypeScript API 타입 또는 Client 생성
    ↓
웹 및 모바일 프로젝트에서 사용
```

OpenAPI를 도입하더라도 모든 코드를 자동 생성하지 않는다.

자동 생성 대상은 다음으로 제한한다.

- 공개 Request 타입
- 공개 Response 타입
- Endpoint 호출 Wrapper
- 오류 응답 타입

다음 항목은 자동 생성 코드에 넣지 않는다.

- 화면 상태 관리
- TanStack Query Hook
- 비즈니스 판단
- 사용자 메시지
- React 또는 React Native UI 코드

생성된 코드는 직접 수정하지 않는다.

변경이 필요하면 API 계약 또는 생성 설정을 수정한 후 다시 생성한다.

소규모 MVP에서는 API Client를 수동 작성할 수 있다.

단, 모바일 앱 개발을 시작하거나 외부 API를 제공할 때는 OpenAPI 문서와 API Client 생성 체계를 마련한다.

---

## 3-5. API 버전 관리와 호환성

웹과 모바일은 배포 주기가 다르므로 모바일 앱 출시 이후에는 API 하위 호환성을 중요하게 관리한다.

모든 공개 API는 URL에 버전을 포함한다.

```text
/v1/bookmarks
/v1/users/me
```

모바일 앱이 사용 중인 API 응답의 기존 필드를 임의로 삭제하거나 의미를 변경하지 않는다.

가능한 변경:

- 선택 필드 추가
- 새로운 Endpoint 추가
- 새로운 오류 코드 추가
- 기존 동작을 유지하는 성능 개선

주의가 필요한 변경:

- 필드 이름 변경
- 필드 타입 변경
- 필수 입력값 추가
- 기존 오류 코드 의미 변경
- Pagination 방식 변경
- 인증 방식 변경

호환되지 않는 변경은 새로운 API 버전으로 제공한다.

```text
/v1/bookmarks
/v2/bookmarks
```

구버전 API를 제거할 때는 다음을 확인한다.

- 활성 모바일 앱 버전의 사용 여부
- 앱스토어 배포 및 업데이트 지연
- 최소 지원 앱 버전
- 제거 예정일
- 사용자 업데이트 유도 정책

---

## 3-6. 여러 서비스 API를 사용하는 모바일 앱

통합 모바일 앱은 서비스별 API Client를 조합하여 사용한다.

```typescript
const clients = {
  bookmark: createBookmarkApiClient({
    baseUrl: env.bookmarkApiUrl,
    getAccessToken,
  }),
  receipt: createReceiptApiClient({
    baseUrl: env.receiptApiUrl,
    getAccessToken,
  }),
};
```

통합 모바일 앱이 여러 서비스의 데이터베이스를 직접 통합하지 않는다.

여러 서비스 데이터의 조합이 단순 화면 표시 목적이면 모바일 앱에서 각 API를 호출하여 조합할 수 있다.

여러 서비스에 걸친 트랜잭션이나 중요한 업무 처리가 필요하면 다음 중 하나를 사용한다.

- 별도의 Orchestration API
- 명확한 주 서비스의 Backend Use Case
- 이벤트 기반 처리
- 공통 `core` 데이터 모델

모바일 앱에서 여러 API 호출을 순서대로 실행하여 중요한 분산 트랜잭션을 구현하지 않는다.

---

## 4. 서비스별 애플리케이션 분리

각 서비스는 프론트엔드와 백엔드 API를 별도 애플리케이션으로 구성한다.

```text
service-a-web
service-a-api
```

프론트엔드는 데이터베이스에 직접 접근하지 않는다.

```text
Web 또는 Mobile
    ↓
REST API
    ↓
Vercel Backend
    ↓
Supabase PostgreSQL
```

Next.js Route Handler와 Server Action에 핵심 비즈니스 로직을 작성하지 않는다.

핵심 비즈니스 로직은 해당 서비스의 백엔드 API 프로젝트에 작성한다.

---

## 5. 백엔드 코드 구조

Controller와 Service를 기계적으로 분리하지 않는다.

작은 기능은 Route와 Use Case를 중심으로 단순하게 구성한다.

```text
apps/service-a-api/src/
├─ app.ts
├─ server.ts
├─ routes/
│  ├─ bookmark.routes.ts
│  └─ user.routes.ts
├─ features/
│  ├─ bookmark/
│  │  ├─ create-bookmark.ts
│  │  ├─ get-bookmark.ts
│  │  ├─ list-bookmarks.ts
│  │  ├─ update-bookmark.ts
│  │  ├─ delete-bookmark.ts
│  │  ├─ bookmark.sql.ts
│  │  ├─ bookmark.schema.ts
│  │  └─ bookmark.types.ts
│  └─ user/
├─ middleware/
├─ config/
└─ errors/
```

기본 호출 흐름은 다음과 같다.

```text
Route
→ Use Case 또는 Feature 함수
→ SQL 함수 또는 공통 라이브러리
→ Database
```

별도 Service Class나 Repository Class는 반드시 필요한 경우에만 만든다.

다음 조건이 있을 때 분리를 검토한다.

- 하나의 비즈니스 로직이 여러 Route에서 재사용된다.
- 트랜잭션 범위가 복잡하다.
- 여러 외부 시스템을 함께 호출한다.
- 하나의 파일이 지나치게 커진다.
- 테스트 격리를 위해 명확한 경계가 필요하다.

단순 CRUD에 불필요한 Interface, Abstract Class, Repository 계층을 만들지 않는다.

---

## 6. Route의 책임

Route는 다음 역할을 담당할 수 있다.

- URL과 HTTP Method 정의
- 인증 Middleware 연결
- Path, Query, Body 입력값 검증
- Use Case 호출
- HTTP 응답 생성

Route 안에 복잡한 SQL이나 긴 비즈니스 로직을 직접 작성하지 않는다.

간단한 흐름은 Route에서 직접 Use Case 함수를 호출한다.

```typescript
app.post('/v1/bookmarks', authRequired, zValidator('json', createBookmarkSchema), async (c) => {
  const user = c.get('user');
  const input = c.req.valid('json');

  const result = await createBookmark({
    userId: user.id,
    input,
  });

  return c.json({
    success: true,
    data: result,
  }, 201);
});
```

---

## 7. 비즈니스 로직 작성 원칙

비즈니스 로직은 Vercel에서 실행되는 백엔드 코드에 둔다.

Supabase Function, Trigger, Edge Function에는 핵심 비즈니스 로직을 두지 않는다.

데이터베이스에는 다음 항목만 허용한다.

- 테이블과 관계
- Foreign Key
- Unique Constraint
- Check Constraint
- Index
- View
- 단순한 데이터 무결성 Trigger
- 최소한의 공통 DB 함수
- 권한과 보안에 필요한 설정

다음 항목은 백엔드 코드에서 처리한다.

- 상태 전이
- 결제 처리
- 요금제 제한
- 알림 조건
- 이메일 발송 조건
- LLM 호출과 결과 처리
- 파일 접근 권한
- 서비스별 접근 권한
- 외부 API 연동
- 사용자 행동에 따른 업무 규칙
- 배치 작업의 처리 순서

DB Trigger에 서비스 정책이나 복잡한 상태 전이를 숨기지 않는다.

---

## 8. 데이터베이스 접근 원칙

ORM을 사용하지 않는다.

SQL을 직접 작성한다.

SQL은 문자열을 임의로 연결하지 않고 Parameter Binding을 사용한다.

```typescript
const result = await db.query(
  `
  select
      id,
      user_id,
      title,
      url,
      created_at
  from bookmark.bookmarks
  where user_id = $1
    and deleted_at is null
  order by created_at desc
  limit $2
  offset $3
  `,
  [userId, limit, offset],
);
```

금지 예시:

```typescript
const sql = `select * from bookmark.bookmarks where user_id = '${userId}'`;
```

SQL Injection 방지를 위해 모든 외부 값은 Parameter Binding을 사용한다.

동적 정렬 컬럼이나 테이블 이름은 허용 목록으로 검증한다.

---

## 9. SQL 파일과 함수 구성

짧은 SQL은 Feature 파일에 둘 수 있다.

복잡하거나 재사용되는 SQL은 별도 파일로 분리한다.

```text
features/bookmark/
├─ list-bookmarks.ts
├─ create-bookmark.ts
└─ bookmark.sql.ts
```

`bookmark.sql.ts` 예시:

```typescript
export const bookmarkSql = {
  findById: `
    select
        id,
        user_id,
        title,
        url,
        created_at,
        updated_at
    from bookmark.bookmarks
    where id = $1
      and deleted_at is null
  `,

  insert: `
    insert into bookmark.bookmarks (
        id,
        user_id,
        title,
        url,
        created_at,
        updated_at
    )
    values ($1, $2, $3, $4, now(), now())
    returning
        id,
        user_id,
        title,
        url,
        created_at,
        updated_at
  `,
};
```

`select *` 사용을 피하고 필요한 컬럼을 명시한다.

SQL 결과는 외부 API 응답 객체로 그대로 노출하지 않는다.

필요한 경우 Mapping 함수를 사용한다.

sql의 소스코드가 너무 길어지지 않도록 컬럼이 10개 이상일 때는 한줄에 나열한다.

---

## 10. 데이터베이스 Schema 규칙

하나의 Supabase 프로젝트에서 여러 서비스를 운영한다.

서비스 간 경계는 PostgreSQL Schema로 구분한다.

```text
core
bookmark
receipt
cafe
```

예시:

```sql
select *
from bookmark.bookmarks;

select *
from receipt.receipts;
```

테이블명에는 서비스 prefix를 반복하지 않는다.

```text
권장: bookmark.bookmarks
비권장: public.bookmark_bookmarks
```

각 서비스 API는 원칙적으로 다음 Schema만 접근한다.

- 자기 서비스 Schema
- 공통 데이터가 있는 `core` Schema

다른 서비스 Schema를 직접 조회하거나 Join하지 않는다.

서비스 간 데이터가 필요하면 다음 중 하나를 사용한다.

- `core` Schema의 공통 데이터
- 상대 서비스의 REST API
- 명시적으로 설계된 이벤트 또는 동기화 테이블

향후 특정 서비스를 별도 Supabase 프로젝트로 분리할 수 있도록 서비스 간 DB 결합을 최소화한다.

---

## 11. 공통 라이브러리 원칙

여러 서비스에서 반복되는 기술 기능은 공통 라이브러리로 만든다.

공통 라이브러리 후보는 다음과 같다.

- 인증
- 권한 검사
- 데이터베이스 연결
- 트랜잭션
- SQL 실행 Utility
- 파일 업로드와 다운로드
- Signed URL 발급
- LLM Provider 호출
- 결제 Provider 연동
- 이메일 발송
- 알림 발송
- 구조화 로깅
- 오류 처리
- 배치 실행
- Retry
- Idempotency
- 환경변수 검증
- API 응답 형식
- HTTP Client
- 외부 API 공통 처리

공통 라이브러리는 업무 도메인을 알지 못해야 한다.

예를 들어 `packages/email`은 이메일을 전송할 수 있지만, 회원가입 이메일을 언제 보내야 하는지는 서비스 코드가 결정한다.

```text
서비스 코드
→ 이메일 발송 여부 결정
→ 공통 email 라이브러리 호출
```

공통 라이브러리에 특정 서비스의 정책을 넣지 않는다.

---

## 12. 공통 라이브러리 설계 기준

공통 라이브러리는 Provider 교체가 가능하도록 단순한 함수 또는 작은 Interface를 제공한다.

과도한 추상화는 피한다.

예시:

```typescript
export interface EmailClient {
  send(input: SendEmailInput): Promise<SendEmailResult>;
}
```

또는 더 단순하게:

```typescript
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  // provider implementation
}
```

하나의 Provider만 사용하고 교체 가능성이 낮으면 함수 형태를 우선한다.

여러 Provider를 동시에 지원하거나 테스트 대체가 필요하면 Interface를 사용한다.

---

## 13. 공통 데이터베이스 라이브러리

`packages/database`는 다음 기능만 담당한다.

- PostgreSQL 연결 생성
- Query 실행
- Transaction 실행
- Query Logging
- 공통 오류 변환
- Timeout
- Retry가 허용되는 오류 판별

예시 API:

```typescript
export interface DatabaseClient {
  query<T>(
    sql: string,
    params?: readonly unknown[],
  ): Promise<QueryResult<T>>;

  transaction<T>(
    callback: (tx: DatabaseClient) => Promise<T>,
  ): Promise<T>;
}
```

서비스별 SQL은 `packages/database`에 넣지 않는다.

서비스별 SQL은 해당 서비스의 `features` 디렉터리에 둔다.

---

## 14. 인증 원칙

인증 기능은 공통 `packages/auth`에서 제공한다.

인증 Provider로 Supabase Auth를 사용할 수 있지만 서비스 코드는 Supabase SDK에 직접 의존하지 않게 한다.

공통 인증 라이브러리는 다음 기능을 제공한다.

- Access Token 검증
- 로그인 사용자 정보 추출
- 인증 Middleware
- Role 확인
- 공통 권한 오류 처리

서비스별 데이터 접근 권한은 각 서비스의 비즈니스 로직에서 검사한다.

```text
공통 auth
→ 사용자가 누구인지 확인

서비스 코드
→ 사용자가 해당 데이터에 접근 가능한지 확인
```

---

## 15. 파일 접근 원칙

파일은 필요에 따라 Supabase Storage를 사용할 수 있다.

Supabase Storage에 직접 접근하는 코드는 `packages/file-storage`에 둔다.

서비스 코드는 Storage Provider의 세부 API를 직접 호출하지 않는다.

권장 흐름:

```text
클라이언트
→ 백엔드 API에 업로드 요청
→ 백엔드가 권한, 파일 크기, MIME Type 검증
→ Signed Upload URL 발급
→ 클라이언트가 Storage에 직접 업로드
→ 백엔드에 업로드 완료 통지
→ 백엔드가 Metadata 저장
```

파일의 접근 권한은 백엔드 비즈니스 로직에서 판단한다.

대용량 파일 본문을 Vercel Function을 통해 전달하지 않는다.

---

## 16. LLM 연동 원칙

LLM Provider 호출은 `packages/llm`에 둔다.

서비스 코드는 OpenAI, Anthropic, Google 등의 SDK를 직접 호출하지 않는다.

공통 LLM 라이브러리는 다음 기능을 제공할 수 있다.

- 텍스트 생성
- 구조화된 JSON 출력
- Embedding 생성
- Streaming
- Timeout
- Retry
- Token 사용량 수집
- 공통 오류 변환

Prompt와 서비스별 출력 Schema는 해당 서비스 코드에 둔다.

```text
공통 llm
→ Provider 호출 방법

서비스 코드
→ Prompt, 업무 목적, 결과 검증
```

LLM 응답은 항상 검증한 후 사용한다.

---

## 17. 결제 원칙

결제 Provider 코드는 `packages/payment`에 둔다.

서비스 코드는 결제 Provider의 원본 Payload에 직접 의존하지 않는다.

공통 결제 라이브러리는 다음 기능을 제공할 수 있다.

- 결제 요청
- 결제 승인
- 결제 취소
- Webhook 서명 검증
- 결제 상태 조회
- Provider 오류 변환

상품, 가격 정책, 환불 가능 여부, 사용량 제한은 서비스 코드에서 결정한다.

Webhook 처리에는 Idempotency를 적용한다.

---

## 18. 로깅 원칙

모든 서비스는 공통 `packages/logging`을 사용한다.

`console.log`를 운영 로그 수단으로 사용하지 않는다.

로그는 구조화된 JSON 형식으로 남긴다.

공통 로그 필드:

```text
timestamp
level
service
environment
requestId
userId
method
path
status
durationMs
errorCode
```

다음 정보는 로그에 남기지 않는다.

- Password
- Access Token
- Refresh Token
- Secret Key
- 결제 카드정보
- 전체 개인정보 Payload
- 원본 LLM API Key
- Signed URL 전체 값

모든 HTTP 요청에는 Request ID를 부여한다.

---

## 19. 이메일과 알림 원칙

이메일 발송은 `packages/email`을 사용한다.

푸시, 문자, Slack, 웹 알림 등은 `packages/notification`에서 제공할 수 있다.

공통 라이브러리는 발송 기능만 담당한다.

발송 시점, 대상, 내용 선택은 서비스의 비즈니스 로직에서 결정한다.

템플릿은 공통 기술 템플릿과 서비스별 업무 템플릿을 구분한다.

---

## 20. 배치 작업 원칙

배치 작업 공통 기능은 `packages/batch`에 둔다.

공통 기능 예시:

- 실행 기록
- 중복 실행 방지
- Lock
- Retry
- Timeout
- 실패 기록
- 처리 건수 기록
- 실행 상태 조회

배치의 실제 업무 내용은 각 서비스 API 프로젝트에 둔다.

Vercel Cron은 배치 실행 Trigger로 사용할 수 있다.

배치 핵심 로직은 Vercel Cron에 직접 종속시키지 않는다.

```text
Cron Adapter
→ 서비스 Batch Use Case
```

장시간 실행되거나 리소스 사용량이 큰 작업은 별도 Worker로 분리할 수 있게 작성한다.

---

## 21. API 응답 규칙

성공 응답:

```json
{
  "success": true,
  "data": {},
  "meta": {
    "requestId": "..."
  }
}
```

오류 응답:

```json
{
  "success": false,
  "error": {
    "code": "BOOKMARK_NOT_FOUND",
    "message": "북마크를 찾을 수 없습니다.",
    "details": null
  },
  "meta": {
    "requestId": "..."
  }
}
```

클라이언트는 오류 메시지가 아니라 오류 코드를 기준으로 처리한다.

내부 SQL, Stack Trace, Secret, Provider 원본 오류를 API 응답에 노출하지 않는다.

---

## 22. 입력 검증 원칙

모든 외부 입력은 검증한다.

검증 대상:

- Path Parameter
- Query Parameter
- Request Body
- Header
- 환경변수
- Webhook Payload
- LLM 응답
- 외부 API 응답

입력 검증에는 Zod를 기본으로 사용한다.

외부 데이터는 `any`가 아니라 `unknown`으로 받고 검증 후 사용한다.

---

## 23. 환경변수 원칙

모든 환경변수는 시작 시 검증한다.

서비스별 `.env.example`을 제공한다.

```env
DATABASE_URL=
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
APP_BASE_URL=
LOG_LEVEL=
```

핵심 코드에서 `VERCEL_URL` 같은 Vercel 전용 환경변수를 직접 사용하지 않는다.

자체 환경변수 이름을 사용하고 배포 환경에서 값을 주입한다.

---

## 24. Vercel 종속성 제한

핵심 애플리케이션 코드는 Vercel Adapter와 분리한다.

```text
src/app.ts
src/server.ts
api/index.ts
```

- `src/app.ts`: Hono Application
- `src/server.ts`: 로컬 또는 일반 Node.js 실행
- `api/index.ts`: Vercel Adapter

서비스 API는 최소한 다음 방식으로 실행 가능해야 한다.

- 로컬 Node.js
- Vercel Functions
- 일반 Node.js 서버
- Docker Container

비즈니스 로직 안에서 Vercel SDK를 직접 사용하지 않는다.

---

## 25. 데이터베이스 Migration 원칙

모든 DB 변경은 SQL Migration으로 관리한다.

```text
database/migrations/
├─ 202607270001_create_bookmark_schema.sql
├─ 202607270002_create_bookmark_tables.sql
└─ 202607270003_add_bookmark_indexes.sql
```

Migration으로 관리할 항목:

- Schema
- Table
- Column
- Constraint
- Foreign Key
- Index
- View
- Function
- Trigger
- Grant
- 보안 정책

운영 DB 구조를 Dashboard에서 직접 수정하지 않는다.

적용한 Migration 파일은 수정하지 않는다.

변경이 필요하면 새 Migration을 추가한다.

Migration 실행은 GitHub Actions에 종속시키지 않는다.

로컬 CLI, GitHub Actions, GitLab CI, Jenkins 등 어떤 환경에서도 같은 명령으로 실행 가능해야 한다.

---

## 26. 테스트 원칙

테스트는 모든 계층을 기계적으로 작성하지 않는다.

다음 항목을 우선 테스트한다.

- 핵심 비즈니스 규칙
- 권한 검사
- 상태 전이
- 결제
- 외부 API 장애 처리
- LLM 응답 검증
- SQL Query 결과 Mapping
- Transaction
- Webhook Idempotency
- 배치 중복 실행 방지

단순 Getter, Mapper, 얇은 Route Wrapper에는 불필요한 테스트를 만들지 않는다.

버그 수정 시 가능하면 재현 테스트를 먼저 추가한다.

---

## 27. 코드 가독성 원칙

가독성과 가시성을 최우선으로 한다.

다음 원칙을 따른다.

- 파일과 함수의 역할이 이름으로 드러나야 한다.
- 하나의 함수는 하나의 주요 책임을 가진다.
- 지나치게 긴 함수는 의미 단위로 분리한다.
- 과도한 Class와 Interface를 만들지 않는다.
- 단순 함수로 충분하면 Class를 만들지 않는다.
- 재사용 가능성이 명확하지 않으면 공통화하지 않는다.
- 세 번 이상 동일한 패턴이 나타날 때 공통화를 검토한다.
- 불필요한 Dependency Injection Framework를 도입하지 않는다.
- Decorator 기반의 숨겨진 동작을 최소화한다.
- Magic String과 Magic Number를 피한다.
- 업무 규칙은 코드에서 명시적으로 보여야 한다.
- 주석은 무엇을 하는지가 아니라 왜 그렇게 하는지를 설명한다.

---

## 28. 프레임워크 사용 제한

기본적으로 다음 핵심 도구만 사용한다.

```text
Next.js
Hono
Zod
PostgreSQL Driver
Tailwind CSS
```

추가 프레임워크나 라이브러리는 다음 조건을 만족할 때만 도입한다.

- 현재 문제를 명확히 해결한다.
- 직접 구현하는 것보다 유지보수 비용이 낮다.
- 기존 도구와 역할이 중복되지 않는다.
- 팀원이 쉽게 이해할 수 있다.
- 제거하거나 교체하기 어렵지 않다.

ORM, Dependency Injection Container, 대형 백엔드 프레임워크는 기본적으로 도입하지 않는다.

---

## 29. 금지 사항

다음 구현을 금지한다.

- ORM 사용
- 프론트엔드에서 업무 테이블 직접 수정
- 핵심 비즈니스 로직을 Supabase Trigger에 작성
- 핵심 비즈니스 로직을 Supabase Edge Function에 작성
- 다른 서비스 Schema 직접 Join
- SQL 문자열에 외부 입력값 직접 결합
- `select *`의 무분별한 사용
- API 응답에 DB Row를 그대로 노출
- Next.js Server Action에 핵심 업무 로직 작성
- Route 파일에 긴 SQL 작성
- 서비스별로 인증, 로깅, 이메일, LLM Client를 중복 구현
- 공통 라이브러리에 서비스별 업무 정책 작성
- `any` 타입의 무분별한 사용
- 운영 DB를 Dashboard에서 직접 수정
- 서버리스 메모리를 영구 저장소로 사용
- 장시간 작업을 일반 HTTP 요청 안에서 처리
- 불필요한 Controller, Service, Repository 계층 생성
- 단순 기능에 과도한 Design Pattern 적용

---

## 30. AI 에이전트 구현 순서

새 기능은 다음 순서로 구현한다.

1. 기능의 목적과 Use Case를 확인한다.
2. API 입력, 출력, 오류 코드를 정의한다.
3. 서비스 Schema와 테이블을 확인한다.
4. 필요한 SQL을 명시적으로 작성한다.
5. 핵심 비즈니스 규칙을 Feature 함수로 구현한다.
6. 공통 기능이 필요하면 기존 `packages`를 먼저 확인한다.
7. 공통 기능이 없을 때만 새 공통 라이브러리 추가를 검토한다.
8. Route와 Middleware를 연결한다.
9. 핵심 규칙과 오류 상황을 테스트한다.
10. 프론트엔드에서 공통 API Client를 통해 호출한다.

AI 에이전트는 코드를 생성하기 전에 항상 다음을 확인한다.

- 기존 공통 패키지로 해결 가능한가?
- 서비스 간 Schema 경계를 침범하지 않는가?
- 비즈니스 로직이 Supabase에 숨겨지지 않았는가?
- SQL이 Parameter Binding을 사용하는가?
- 불필요한 계층과 프레임워크가 추가되지 않았는가?
- 코드만 읽어도 처리 흐름을 이해할 수 있는가?
- 향후 모바일 앱에서도 동일한 API를 사용할 수 있는가?
- 모바일 앱이 사용할 공개 API 계약과 API Client가 분리되어 있는가?
- API Client가 React, Next.js, React Native에 종속되지 않은 순수 TypeScript인가?
- 모바일 앱 출시 후에도 API 하위 호환성을 유지할 수 있는가?
- Vercel 이외의 Node.js 환경에서도 실행 가능한가?
